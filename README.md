# 🌿 Canopy — Carbon Intelligence App

A responsive marketing landing page for **Canopy**, a fictional carbon-intelligence
SaaS product, built as an internship project (NeuroFive Solutions). It combines
a fully responsive, animated frontend with one section that consumes a real,
live public API.

🔗 **Live site:** https://canopy-carbonintelligent.vercel.app

---



### 🌐 Live public API integration
- The **Air Quality** section fetches live data for ~18 cities in parallel
  from Open-Meteo, with:
  - Visible loading skeletons while data is being fetched
  - Per-city error handling (one failed city doesn't break the rest)
  - A global friendly-error banner with a **Retry** button if the whole
    request fails
  - A live search/filter input over the displayed cities
- No API key or account required — this was a deliberate choice after an
  earlier attempt using the Electricity Maps API hit free-tier limits
  (that provider's free key is scoped to a single country/zone, which
  didn't fit a page meant to show many countries at once).



---

## 🚀 Getting started

Requirements: **Node.js 20.19+ or 22.12+**

```bash
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`) — open it in a browser.

Other commands:
```bash
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

No `.env` file or API key is required to run this project — the Open-Meteo API
is fully public.

---


---

## ☁️ Deployment

Deployed on **Vercel** at https://canopy-carbondata.vercel.app.

Vercel settings that matter for this project:
- Framework Preset: `Vite`
- Root Directory: repo root (where `package.json` lives)
- Build Command: `npm run build`
- Output Directory: `dist`

No environment variables need to be configured on Vercel, since the app
doesn't require an API key.

---


  
