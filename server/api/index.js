// Vercel serverless entry point. Vercel's Node.js runtime accepts an
// Express app directly as the default export — no listen() call needed,
// Vercel handles invoking it per-request.
import 'dotenv/config'
import app from '../app.js'

export default app
