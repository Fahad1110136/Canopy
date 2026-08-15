import User from './models/User.js'

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

export async function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase()
  const doc = await User.findOne({ email: normalized })
  return toPlain(doc)
}

export async function findUserById(id) {
  const doc = await User.findOne({ id })
  return toPlain(doc)
}

export async function findUserByVerificationToken(token) {
  const doc = await User.findOne({ verificationToken: token })
  return toPlain(doc)
}

export async function createUser({ name, email, passwordHash, companyId, role, verificationToken, verificationTokenExpiry }) {
  const user = {
    id: genId(),
    name,
    email: email.trim().toLowerCase(),
    passwordHash,
    companyId,
    role,
    verified: false,
    verificationToken,
    verificationTokenExpiry,
    createdAt: new Date().toISOString(),
  }
  const doc = await User.create(user)
  return toPlain(doc)
}

export async function setVerificationToken(userId, token, expiry) {
  const doc = await User.findOneAndUpdate(
    { id: userId },
    { verificationToken: token, verificationTokenExpiry: expiry },
    { new: true }
  )
  return toPlain(doc)
}

export async function markUserVerified(userId) {
  const doc = await User.findOneAndUpdate(
    { id: userId },
    { verified: true, verificationToken: null, verificationTokenExpiry: null },
    { new: true }
  )
  return toPlain(doc)
}

export function toPublicUser(user) {
  if (!user) return null
  const { passwordHash, verificationToken, verificationTokenExpiry, ...publicUser } = user
  return publicUser
}








// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'
// const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const DB_PATH = path.join(__dirname, 'data', 'users.json')
// function readAll() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) }
// function writeAll(users) { fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2)) }
// export function findUserByEmail(email) {
//   const normalized = email.trim().toLowerCase()
//   return readAll().find((u) => u.email.toLowerCase() === normalized) || null
// }
// export function findUserById(id) { return readAll().find((u) => u.id === id) || null }
// export function findUserByVerificationToken(token) {
//   return readAll().find((u) => u.verificationToken === token) || null
// }
// export function createUser({ name, email, passwordHash, companyId, role, verificationToken, verificationTokenExpiry }) {
//   const users = readAll()
//   const user = {
//     id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
//     name,
//     email: email.trim().toLowerCase(),
//     passwordHash,
//     companyId,
//     role,
//     verified: false,
//     verificationToken,
//     verificationTokenExpiry,
//     createdAt: new Date().toISOString(),
//   }
//   users.push(user); writeAll(users); return user
// }
// export function setVerificationToken(userId, token, expiry) {
//   const users = readAll()
//   const user = users.find((u) => u.id === userId)
//   if (!user) return null
//   user.verificationToken = token
//   user.verificationTokenExpiry = expiry
//   writeAll(users)
//   return user
// }
// export function markUserVerified(userId) {
//   const users = readAll()
//   const user = users.find((u) => u.id === userId)
//   if (!user) return null
//   user.verified = true
//   user.verificationToken = null
//   user.verificationTokenExpiry = null
//   writeAll(users)
//   return user
// }
// export function toPublicUser(user) {
//   if (!user) return null
//   const { passwordHash, verificationToken, verificationTokenExpiry, ...publicUser } = user
//   return publicUser
// }