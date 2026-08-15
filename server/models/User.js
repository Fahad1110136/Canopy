import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  companyId: { type: String, required: true },
  role: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationTokenExpiry: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

export default mongoose.models.User || mongoose.model('User', userSchema)