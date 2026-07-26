import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data', 'users.json')

function readAll() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

function writeAll(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
}

export function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase()
  return readAll().find((u) => u.email.toLowerCase() === normalized) || null
}

export function findUserById(id) {
  return readAll().find((u) => u.id === id) || null
}

export function createUser({ name, email, passwordHash }) {
  const users = readAll()
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    email: email.trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  writeAll(users)
  return user
}

/** Strips the password hash before sending a user object to the client. */
export function toPublicUser(user) {
  if (!user) return null
  const { passwordHash, ...publicUser } = user
  return publicUser
}