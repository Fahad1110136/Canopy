import multer from 'multer'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// On Vercel (and most serverless platforms) the project directory is
// read-only — only /tmp is writable, and even that doesn't persist
// between invocations. We detect that environment and write there
// instead, so the app doesn't crash; uploaded files just won't survive
// past the current request/instance (same caveat as before, now safe).
export const UPLOAD_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'canopy-uploads')
  : path.join(__dirname, 'uploads')

export const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) return cb(new Error('INVALID_FILE_TYPE'))
    cb(null, true)
  },
})

/** Wraps a multer middleware call so its errors come back as clean JSON. */
export function handleUploadErrors(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) return next()
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File must be smaller than 5MB.' })
      }
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: 'File must be a PNG, JPEG, WEBP image, or PDF.' })
      }
      return res.status(400).json({ error: 'Could not process the uploaded file.' })
    })
  }
}