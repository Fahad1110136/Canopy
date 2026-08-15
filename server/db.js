import mongoose from 'mongoose'

let connected = false

export async function connectDB() {
  if (connected) return mongoose.connection

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file (or Render environment variables).')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  connected = true
  console.log('Connected to MongoDB')
  return mongoose.connection
}