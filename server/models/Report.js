import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  facilityId: { type: String, required: true },
  facilityName: { type: String, required: true },
  companyId: { type: String, required: true },
  reportDate: { type: String, required: true },
  scope: { type: String, required: true },
  amount: { type: Number, required: true },
  reporterName: { type: String, required: true },
  notes: { type: String, default: '' },
  evidenceFile: { type: mongoose.Schema.Types.Mixed, default: null },
  submittedBy: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

export default mongoose.models.Report || mongoose.model('Report', reportSchema)
