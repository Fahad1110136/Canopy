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








// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'
// const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const DB_PATH = path.join(__dirname, 'data', 'facilities.json')
// function readAll() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) }
// function writeAll(facilities) { fs.writeFileSync(DB_PATH, JSON.stringify(facilities, null, 2)) }
// export function getFacilities() { return readAll() }
// export function getFacilitiesByCompany(companyId) { return readAll().filter((f) => f.companyId === companyId) }
// export function getFacilityById(id) { return readAll().find((f) => f.id === id) || null }
// export function createFacility(data) {
//   const facilities = readAll()
//   const newFacility = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), createdAt: new Date().toISOString(), ...data }
//   facilities.push(newFacility); writeAll(facilities); return newFacility
// }
// export function updateFacility(id, data) {
//   const facilities = readAll()
//   const idx = facilities.findIndex((f) => f.id === id)
//   if (idx === -1) return null
//   facilities[idx] = { ...facilities[idx], ...data, id, updatedAt: new Date().toISOString() }
//   writeAll(facilities); return facilities[idx]
// }
// export function deleteFacility(id) {
//   const facilities = readAll()
//   const idx = facilities.findIndex((f) => f.id === id)
//   if (idx === -1) return false
//   facilities.splice(idx, 1); writeAll(facilities); return true
// }
