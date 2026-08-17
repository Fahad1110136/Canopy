# 🌿 Canopy

Canopy is a carbon emissions tracking platform for companies. Teams sign up, register their facilities, and log emissions reports (Scope 1, 2, and 3) with supporting evidence — turning what's usually a once-a-year compliance scramble into something tracked continuously, with an audit trail.

🔗 **Live app:** https://canopy-carbonintelligent.vercel.app
🔗 **Live API:** https://canopy-carbonintelligent-backend.vercel.app

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- React Router (client-side routing)
- Tailwind CSS
- Framer Motion (animations)
- Recharts (dashboard/analytics charts)
- Three.js / React Three Fiber (landing page visuals)
- Lucide React (icons)

**Backend**
- Node.js + Express (deployed as a Vercel serverless function)
- MongoDB Atlas via Mongoose — persistent data storage
- JWT-based authentication (`jsonwebtoken`)
- bcrypt for password hashing (`bcryptjs`)
- Multer (memory storage) for handling multipart uploads
- Cloudinary — permanent storage for uploaded evidence files (PDFs/images)
- Nodemailer / Resend — verification emails

**Infrastructure**
- Frontend hosting: [Vercel](https://vercel.com)
- Backend hosting: [Vercel](https://vercel.com) (serverless functions)
- Database: [MongoDB Atlas](https://www.mongodb.com/atlas) (free M0 cluster)
- File storage: [Cloudinary](https://cloudinary.com) (free tier)

---

## 🏗️ Architecture

Canopy is split into two independently deployed Vercel projects sharing one GitHub repo:

```
                    ┌─────────────────────┐
                    │   MongoDB Atlas      │  ← persistent data
                    │   (users, companies,  │     (survives restarts,
                    │   facilities, reports) │      redeploys, cold starts)
                    └──────────▲───────────┘
                               │
┌──────────────┐      ┌────────┴────────┐      ┌──────────────┐
│   Frontend    │─────▶│   Backend        │─────▶│  Cloudinary   │
│  (Vercel)     │ HTTP │  (Vercel,        │ HTTP │  (evidence    │
│  React SPA    │      │   serverless fn) │      │  file storage)│
└──────────────┘      └─────────────────┘      └──────────────┘
```

**Why two separate Vercel projects?** The frontend is a static React build; the backend is an Express app wrapped as a single serverless function (`server/api/index.js`) with `server/vercel.json` routing all traffic to it. Keeping them separate means each can be redeployed, scaled, or debugged independently, and the backend can be reused by other clients later if needed.

**Why MongoDB instead of local files?** The project originally stored data in local JSON files. On serverless platforms (Vercel) and free-tier PaaS platforms (Render), the filesystem is either read-only or gets wiped on every cold start/redeploy. MongoDB Atlas lives independently of the backend process, so data persists regardless of how often the backend restarts.

**Why Cloudinary for uploads?** Same underlying problem as above, but for binary files (report evidence). Multer now uses in-memory storage and streams the file buffer directly to Cloudinary; the backend never writes anything to its own disk.

---

## 📁 Project Structure

```
canopy/
├── vercel.json         
├── index.html
├── src/                      
│   ├── components/       
│   ├── pages/           
│   ├── context/               
│   ├── services/              
│   ├── store/               
│   ├── utils/                   
│   └── three/                 
└── server/                 
    ├── vercel.json        
    ├── api/
    ├── app.js              
    ├── index.js             
    ├── db.js                  
    ├── uploadConfig.js          
    ├── models/             
    ├── store.js               
    ├── storeUsers.js          
    ├── storeCompanies.js     
    ├── storeReports.js         
    ├── routes/
    ├── middleware/
    └── utils/
```

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string (see below)
- A Cloudinary account (free tier)

### Frontend

```bash
npm install
npm run dev
```
Runs on `http://localhost:5173`

### Backend

```bash
cd server
npm install
npm run dev
```
Runs on `http://localhost:4000`

---

## 🔑 Environment Variables

### Frontend (`.env` at project root, or Vercel → frontend project → Environment Variables)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, including `/api` | `https://canopy-carbonintelligent-backend.vercel.app/api` |

If unset, the frontend falls back to `http://localhost:4000/api` for local development.

### Backend (`server/.env`, or Vercel → backend project → Environment Variables)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string, including database name (e.g. `.../canopy?retryWrites=true...`) |
| `JWT_SECRET` | Secret used to sign/verify login tokens |
| `PORT` | Port for local dev only (Render/Vercel set this automatically in production) |
| `EMAIL_USER` | Gmail address used to send verification emails |
| `EMAIL_APP_PASSWORD` | Gmail [App Password](https://myaccount.google.com/apppasswords) (not your regular password) |
| `APP_URL` | Base URL of the **live frontend** — used to build verification email links. Must NOT be `localhost` in production. |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |


---

## 🗂️ Data Models

**User** — `name`, `email` (unique), `passwordHash`, `companyId`, `role` (`admin` | `member`), `verified`, `verificationToken`, `verificationTokenExpiry`, `createdAt`

**Company** — `name`, `joinCode` (unique, 6-character), `createdAt`

**Facility** — `name`, `location`, `category`, `monthlyEmissions`, `notes`, `companyId`, `createdAt`, `updatedAt`

**Report** — `facilityId`, `facilityName`, `companyId`, `reportDate`, `scope`, `amount`, `reporterName`, `notes`, `evidenceFile` (`{ url, publicId, ... }` or `null`), `submittedBy`, `createdAt`

All models use a custom `id` string field (not Mongo's `_id`) for consistency with the app's original JSON-file-based design.

---

## 🚀 Deployment

### Frontend (Vercel)
- Framework preset: Vite/React (auto-detected)
- Root directory: project root
- `vercel.json` at the root handles SPA routing — without it, direct visits to routes like `/verify`, `/dashboard`, `/login` return 404s, since Vercel doesn't know to hand off to React Router for paths that aren't real files.
- Auto-deploys on push to `main`.

### Backend (Vercel)
- Framework preset: Other / Express (auto-detected)
- Root directory: `server`
- Build command: none
- `server/vercel.json` rewrites all incoming requests to `server/api/index.js`, which exports the Express app.
- Auto-deploys on push to `main`.

### Database (MongoDB Atlas)
- Free M0 cluster.
- Network Access must allow `0.0.0.0/0`.
- Connection pooling/race-condition handling: `db.js` caches the **connection promise** (not just a boolean) so concurrent requests hitting a warm serverless instance await the same in-flight connection instead of racing to open duplicate ones — this was the root cause of intermittent "could not connect" errors early in deployment.

### File Storage (Cloudinary)
- Free tier, 25GB storage/bandwidth.
- Files are uploaded to a `canopy-reports` folder.
- Multer uses memory storage (not disk) — files are streamed directly from the upload request to Cloudinary, since Vercel's filesystem is read-only outside of `/tmp`.

---

## 🔌 Third-Party Services

| Service | Purpose | Free tier limit |
|---|---|---|
| MongoDB Atlas | Primary database | 512MB storage (M0) |
| Cloudinary | Evidence file storage | 25GB storage/bandwidth per month |
| Vercel | Frontend + backend hosting | Generous Hobby tier, no card required |

---
