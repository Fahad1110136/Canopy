import Company from './models/Company.js'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Excludes visually ambiguous characters (0/O, 1/I) so join codes are easy
// to read aloud or retype correctly.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function toPlain(doc) {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : doc
  delete obj._id
  delete obj.__v
  return obj
}

function generateJoinCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

export async function getCompanyById(id) {
  const doc = await Company.findOne({ id })
  return toPlain(doc)
}

export async function getCompanyByJoinCode(code) {
  const normalized = code.trim().toUpperCase()
  const doc = await Company.findOne({ joinCode: normalized })
  return toPlain(doc)
}

export async function createCompany(name) {
  let joinCode
  let exists = true
  while (exists) {
    joinCode = generateJoinCode()
    exists = await Company.findOne({ joinCode })
  }

  const company = {
    id: genId(),
    name: name.trim(),
    joinCode,
    createdAt: new Date().toISOString(),
  }
  const doc = await Company.create(company)
  return toPlain(doc)
}








// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const DB_PATH = path.join(__dirname, 'data', 'companies.json')

// // Excludes visually ambiguous characters (0/O, 1/I) so join codes are easy
// // to read aloud or retype correctly.
// const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

// function readAll() {
//   return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
// }

// function writeAll(companies) {
//   fs.writeFileSync(DB_PATH, JSON.stringify(companies, null, 2))
// }

// function generateJoinCode() {
//   let code = ''
//   for (let i = 0; i < 6; i++) {
//     code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
//   }
//   return code
// }

// export function getCompanyById(id) {
//   return readAll().find((c) => c.id === id) || null
// }

// export function getCompanyByJoinCode(code) {
//   const normalized = code.trim().toUpperCase()
//   return readAll().find((c) => c.joinCode === normalized) || null
// }

// export function createCompany(name) {
//   const companies = readAll()

//   let joinCode
//   do {
//     joinCode = generateJoinCode()
//   } while (companies.some((c) => c.joinCode === joinCode))

//   const company = {
//     id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
//     name: name.trim(),
//     joinCode,
//     createdAt: new Date().toISOString(),
//   }
//   companies.push(company)
//   writeAll(companies)
//   return company
// }