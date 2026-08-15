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
