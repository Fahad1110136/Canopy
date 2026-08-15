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








// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const DB_PATH = path.join(__dirname, 'data', 'reports.json')

// function readAll() {
//   const raw = fs.readFileSync(DB_PATH, 'utf-8')
//   return JSON.parse(raw)
// }

// function writeAll(reports) {
//   fs.writeFileSync(DB_PATH, JSON.stringify(reports, null, 2))
// }

// export function getReports() {
//   return readAll()
// }

// export function createReport(data) {
//   const reports = readAll()
//   const report = {
//     id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
//     createdAt: new Date().toISOString(),
//     ...data,
//   }
//   reports.push(report)
//   writeAll(reports)
//   return report
// }