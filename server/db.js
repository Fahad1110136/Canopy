import mongoose from 'mongoose'

let connectionPromise = null

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI is not set. Add it to your .env file (or Vercel/Render environment variables).')
    }

    mongoose.set('strictQuery', true)
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      })
      .then((conn) => {
        console.log('Connected to MongoDB')
        return conn.connection
      })
      .catch((err) => {
        // Reset so the NEXT request gets a fresh attempt instead of
        // being stuck reusing a rejected promise forever.
        connectionPromise = null
        throw err
      })
  }

  return connectionPromise
}