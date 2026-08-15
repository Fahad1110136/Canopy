import Report from './models/Report.js'

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

export async function getReports() {
  const docs = await Report.find({})
  return docs.map(toPlain)
}

export async function createReport(data) {
  const report = {
    id: genId(),
    createdAt: new Date().toISOString(),
    ...data,
  }
  const doc = await Report.create(report)
  return toPlain(doc)
}
