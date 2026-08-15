import Facility from './models/Facility.js'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function toPlain(doc) {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : doc
  delete obj._id
  delete obj.__v
  return obj
}

export async function getFacilities() {
  const docs = await Facility.find({})
  return docs.map(toPlain)
}

export async function getFacilitiesByCompany(companyId) {
  const docs = await Facility.find({ companyId })
  return docs.map(toPlain)
}

export async function getFacilityById(id) {
  const doc = await Facility.findOne({ id })
  return toPlain(doc)
}

export async function createFacility(data) {
  const newFacility = { id: genId(), createdAt: new Date().toISOString(), ...data }
  const doc = await Facility.create(newFacility)
  return toPlain(doc)
}

export async function updateFacility(id, data) {
  const doc = await Facility.findOneAndUpdate(
    { id },
    { ...data, updatedAt: new Date().toISOString() },
    { new: true }
  )
  return toPlain(doc)
}

export async function deleteFacility(id) {
  const res = await Facility.deleteOne({ id })
  return res.deletedCount > 0
}
