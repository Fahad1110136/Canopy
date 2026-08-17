import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { upload, handleUploadErrors, cloudinary } from '../uploadConfig.js'

const router = Router()

// Streams a buffer to Cloudinary via its upload_stream API (no temp file
// on disk anywhere — the buffer goes straight from memory to Cloudinary).
function uploadBufferToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'canopy-reports',
        resource_type: 'auto', // handles both images and PDFs correctly
        // Keeps a recognizable original filename in Cloudinary's admin
        // console, purely for your own reference when browsing there.
        filename_override: originalName,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })
}

// POST /api/uploads — upload a single file, get back its permanent
// Cloudinary URL + metadata. Generic and feature-agnostic: any form
// (report evidence, a future avatar uploader, etc.) can call this and
// attach the returned metadata to whatever resource it belongs to.
router.post('/', requireAuth, handleUploadErrors(upload.single('file')), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' })
  }

  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname)
    res.status(201).json({
      // public_id is what we need later to delete the file from Cloudinary.
      publicId: result.public_id,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: result.secure_url,
    })
  } catch (err) {
    console.error('Cloudinary upload failed:', err)
    res.status(500).json({ error: 'Could not upload the file. Please try again.' })
  }
})

// DELETE /api/uploads/:publicId — removes an uploaded-but-not-yet-attached
// file from Cloudinary (e.g. the user changed their mind before submitting
// the form it belongs to), so we don't accumulate orphaned files.
// publicId contains a slash (folder/filename), so it's passed as a query
// param rather than a route param to avoid Express splitting it in two.
router.delete('/', requireAuth, async (req, res) => {
  const { publicId } = req.query
  if (!publicId || typeof publicId !== 'string' || !publicId.startsWith('canopy-reports/')) {
    return res.status(400).json({ error: 'Invalid file reference.' })
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    res.status(204).send()
  } catch (err) {
    console.error('Cloudinary delete failed:', err)
    res.status(500).json({ error: 'Could not delete the file.' })
  }
})

export default router