# 🌿 Canopy — Carbon Intelligence App

A full-stack app for **Canopy**, a carbon-intelligence SaaS product.
It combines a responsive, animated marketing site, a real user authentication
system, a self-built CRUD backend, and section wired to a live public API.

---

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Frontend framework | React 19 + Vite 8 + React Router |
| Styling | Tailwind CSS v4 (`@theme` design tokens) |
| Animation | Framer Motion |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Icons | lucide-react |
| Backend | Node.js + Express |
| Auth | bcryptjs (password hashing) + jsonwebtoken (JWT) |
| Data storage | Simple JSON files (no external database needed) |
| Live data | [Open-Meteo Air Quality API](https://open-meteo.com/) — free, no key required |

---

## ✨ Features built

### 📱 Responsive design & component structure
- Fully responsive across mobile, tablet, and desktop breakpoints.
- Every section/page is its own component under `src/components/` or `src/pages/`.
- One shared design system (colors, type scale, spacing) defined in `src/index.css`.

### 🎬 Motion & 3D
- Signature 3D element: a low-poly tree (`src/three/CanopyTree.jsx`) that grows
  as you scroll the hero, built with React Three Fiber.
- Parallax hero background, scroll-triggered reveals, count-up stats, a
  mouse-tracked 3D tilt on the dashboard preview card, and a scroll-progress bar.
- All motion respects `prefers-reduced-motion`.

### 🔐 Authentication (signup, login, protected pages, logout)
- **Signup** (`/signup`) — client-side validation (name, email format, password
  rules shown live as a checklist: 8+ characters, a letter, a number, confirm
  password match). Backend re-validates everything independently and never
  trusts the frontend alone.
- **Login** (`/login`) — validates required fields client-side; backend
  returns a deliberately generic "invalid email or password" message on any
  failure, so a login attempt can't be used to check which emails are registered.
- **Passwords** are hashed with bcrypt before ever touching disk — the raw
  password is never stored anywhere.
- **Sessions** use JWTs (JSON Web Tokens), signed by the backend and stored in
  the browser's `localStorage`, attached automatically to authenticated
  requests via an `Authorization: Bearer <token>` header.
- **Protected route:** `/dashboard` — visiting it while logged out redirects
  straight to `/login`; after logging in you're sent back to where you were
  headed.
- **Logout** clears the token from `localStorage` and resets the app's auth
  state, immediately locking you out of `/dashboard` again.

### 🗄️ Full CRUD — Facilities registry (lives inside `/dashboard`)
- Add, edit, and delete "facilities" (emission sources) through a form and
  card list, all persisted by our own Express backend.
- Reading the list is public; creating, editing, or deleting requires a
  valid login token (enforced on the backend, not just hidden in the UI).
- Every action shows a real loading state and a friendly error message if
  something fails — nothing is faked or instant.

### 🌐 Live public API integration
- The **Air Quality** section fetches live data for ~18 cities in parallel
  from Open-Meteo, with:
  - Visible loading skeletons while data is being fetched
  - Per-city error handling (one failed city doesn't break the rest)
  - A global friendly-error banner with a **Retry** button if the whole
    request fails
  - A live search/filter input over the displayed cities
- No account or API key required for this section — it's public.

---

## 🚀 Getting started

This project has **two servers** that both need to run at the same time —
the backend (Express API) and the frontend (Vite).

Requirements: **Node.js 20.19+ or 22.12+**

### 1. Backend

```bash
cd server
npm install
npm run dev
```
Starts on `http://localhost:4000`.

### 2. Frontend (in a separate terminal)

```bash
npm install
npm run dev
```
Vite prints a local URL (usually `http://localhost:5173`) — open it in a browser.
---

## 📁 Project structure

```
Canopy/
├── .env
├── index.html
├── vite.config.js
├── package.json
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx                   
│   ├── index.css                  
│   ├── pages/
│   ├── context/
│   ├── components/
│   ├── three/
│   ├── hooks/
│   ├── utils/
│   ├── services/
│   └── data/
└── server/
    ├── .env
    ├── package.json
    ├── index.js                    
    ├── store.js                   
    ├── storeUsers.js              
    ├── utils/
    ├── middleware/
    ├── routes/
    └── data/
```

## 🔒 A note on security tradeoffs

Two deliberate choices worth knowing about if this project grows further:

- **Auth tokens live in `localStorage`**, not an httpOnly cookie. Simpler to
  build and standard for a project like this, but readable by any JS running
  on the page — a real production app would typically move to httpOnly
  cookies set by the server instead.
- **No email verification.** Signup accepts any email that merely *looks*
  valid (e.g. `test@example.com`) — there's no confirmation link sent, since
  that requires wiring up an actual email-sending service, which is a
  reasonable next feature rather than part of this pass.

---
