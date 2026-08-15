import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  joinCode: { type: String, required: true, unique: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

export default mongoose.models.Company || mongoose.model('Company', companySchema)