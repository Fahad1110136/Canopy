import express from 'express'
import cors from 'cors'
import facilitiesRouter from './routes/facilities.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Canopy backend API is running' })
})

app.use('/api/facilities', facilitiesRouter)

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