import mongoose from 'mongoose'

const facilitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  monthlyEmissions: { type: Number, required: true },
  notes: { type: String, default: '' },
  companyId: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: null },
})

export default mongoose.models.Facility || mongoose.model('Facility', facilitySchema)
