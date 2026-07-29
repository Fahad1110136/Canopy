import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import facilitiesRouter from './routes/facilities.js'
import authRouter from './routes/auth.js'
import reportsRouter from './routes/reports.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(UPLOAD_DIR))

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Canopy backend API is running' })
})

app.use('/api/facilities', facilitiesRouter)
app.use('/api/auth', authRouter)
app.use('/api/reports', reportsRouter)

// 404 for anything else under /api
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Centralized error handler — keeps error responses consistent JSON shape
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Canopy backend listening on http://localhost:${PORT}`)
})
