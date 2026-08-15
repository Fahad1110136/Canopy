// Local development entry point only. On Vercel, api/index.js is the
// entry point instead — this file is never used in that deployment.
import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Canopy backend listening on http://localhost:${PORT}`))
