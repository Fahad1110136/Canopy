import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { connectDB } from './db.js'
import facilitiesRouter from './routes/facilities.js'
import authRouter from './routes/auth.js'
import reportsRouter from './routes/reports.js'
import uploadsRouter from './routes/uploads.js'
import { UPLOAD_DIR } from './uploadConfig.js'

// Best-effort — on Vercel this points to /tmp (writable but not
// persistent); locally it's the real uploads/ folder. Wrapped in
// try/catch so a read-only filesystem elsewhere never crashes startup.
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
} catch (err) {
  console.error('Could not create upload directory:', err.message)
}

const app = express()
app.use(cors())
app.use(express.json())

// Ensures the MongoDB connection is established before any route runs.
// connectDB() caches the connection internally, so on a warm serverless
// instance this is a no-op after the first request.
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('Database connection failed:', err.message)
    res.status(500).json({ error: 'Database connection failed' })
  }
})

app.use('/uploads', express.static(UPLOAD_DIR))
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Canopy backend API is running' }))
app.use('/api/facilities', facilitiesRouter)
app.use('/api/auth', authRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }) })

export default app
