import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Memory storage instead of disk — we never write the file to this
// server at all. Multer just holds the buffer in memory long enough for
// us to stream it straight to Cloudinary, which is what actually stores
// it (permanently, unlike our own filesystem).
const storage = multer.memoryStorage()

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
