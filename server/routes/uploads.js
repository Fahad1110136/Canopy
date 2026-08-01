import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { requireAuth } from '../middleware/requireAuth.js'
import { upload, handleUploadErrors, UPLOAD_DIR } from '../uploadConfig.js'

const router = Router()

// Matches only the filenames our own storage config generates
// (timestamp-random.ext) — guards against path traversal on delete.
const SAFE_FILENAME_RE = /^[0-9]+-[a-z0-9]+\.[a-z0-9]+$/i

// POST /api/uploads — upload a single file, get back its URL + metadata.
// Generic and feature-agnostic: any form (report evidence, a future avatar
// uploader, etc.) can call this and attach the returned metadata to
// whatever resource it belongs to.
router.post('/', requireAuth, handleUploadErrors(upload.single('file')), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' })
  }
  res.status(201).json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  })
})

// DELETE /api/uploads/:filename — removes an uploaded-but-not-yet-attached
// file (e.g. the user changed their mind before submitting the form it
// belongs to), so we don't accumulate orphaned files on disk.
router.delete('/:filename', requireAuth, (req, res) => {
  const { filename } = req.params
  if (!SAFE_FILENAME_RE.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename.' })
  }
  const filePath = path.join(UPLOAD_DIR, filename)
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ error: 'Could not delete the file.' })
    }
    res.status(204).send()
  })
})

export default router