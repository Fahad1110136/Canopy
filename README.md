# 🌿 Canopy — Carbon Intelligence Landing Page

A responsive marketing landing page for **Canopy**, a fictional carbon-intelligence
SaaS product, built as an internship project (NeuroFive Solutions). It combines
a fully responsive, animated frontend with one section that consumes a real,
live public API.

**Live site:** https://canopy-carbondata.vercel.app

---

## 🛠️ Tech stack

| Purpose | Library |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` design tokens, no separate config file) |
| Animation | Framer Motion |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Icons | lucide-react |
| Live data | [Open-Meteo Air Quality API](https://open-meteo.com/) — free, no key required |

---

## 🔍 What's actually live vs. hardcoded

Since this is a landing page for a product that doesn't exist yet, most of the
page is intentionally polished placeholder content. Only one section calls a
real API:

| Section | Real or mocked? |
|---|---|
| **"Air quality, wherever your teams are"** (near the bottom) | ✅ **Live.** Calls the Open-Meteo API on every page load and shows real, current air-quality readings (EU AQI, PM2.5, ozone) for ~18 cities. |
| Hero, dashboard preview mockup ("52.0 t CO₂e" card) | ❌ Hardcoded placeholder numbers |
| Stats section (42% reduction, 1,200+ facilities, etc.) | ❌ Invented marketing figures |
| Testimonial (Renata Marsh / Basalt Foods) | ❌ Fictional quote and company |
| Trust bar logos (Northwind, Fernwell, etc.) | ❌ Fictional company names |

---

## ✨ Features built

### 📱 Responsive design & component structure
- Fully responsive across mobile, tablet, and desktop breakpoints.
- Every section is its own component under `src/components/`.
- Consistent design system (colors, type scale, spacing) defined once in
  `src/index.css` under Tailwind's `@theme`.

### 🎬 Motion & 3D
- **Signature 3D element:** a low-poly tree (`src/three/CanopyTree.jsx`) in the
  hero that visibly "grows" as you scroll — built with React Three Fiber,
  driven by a custom scroll-tracking hook (`useScrollGrowth`).
- **Parallax:** hero background blobs and copy drift at different scroll speeds.
- **Scroll-triggered reveals:** staggered fade/slide-ins on feature cards, the
  "how it works" steps, and more, via Framer Motion's `whileInView`.
- **Count-up numbers:** the stats section animates from 0 to its final value
  when scrolled into view.
- **Mouse-tracked 3D tilt:** the dashboard preview card tilts toward the
  cursor using Framer Motion's spring-smoothed motion values.
- A thin scroll-progress bar fixed to the top of the viewport.
- All motion respects `prefers-reduced-motion`.

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

### 🎨 Branding
- Custom favicon (`public/favicon.svg`) — a leaf mark in the site's forest
  green and gold, replacing the default Vite icon, matching the leaf icon
  used in the navbar.

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

## 📁 Project structure

```
Canopy/
├── index.html                  ← HTML shell, page title + meta description
├── vite.config.js              ← Vite + Tailwind + React plugin config
├── package.json                ← dependencies + npm scripts
├── public/
│   └── favicon.svg             ← custom Canopy leaf favicon
└── src/
    ├── main.jsx                ← React entry point
    ├── App.jsx                 ← assembles every section in page order
    ├── index.css                ← design tokens: colors, fonts, global resets
    ├── components/
    │   ├── Navbar.jsx            ← sticky glass nav, scroll-aware, mobile menu
    │   ├── ScrollProgress.jsx    ← top-of-viewport scroll progress bar
    │   ├── Hero.jsx              ← headline + parallax blobs + 3D tree canvas
    │   ├── TrustBar.jsx          ← infinite-scroll marquee (mocked logos)
    │   ├── StatsSection.jsx      ← count-up stats on scroll-into-view (mocked)
    │   ├── FeaturesSection.jsx   ← 4-card feature grid, staggered reveal
    │   ├── HowItWorks.jsx        ← 4-step numbered process
    │   ├── DashboardPreview.jsx  ← product mockup card, mouse-tracked 3D tilt (mocked)
    │   ├── AirQualitySection.jsx ← ⭐ the live section — fetches real API data
    │   ├── Testimonial.jsx       ← customer quote (mocked)
    │   ├── CTASection.jsx        ← closing call-to-action banner
    │   └── Footer.jsx            ← link columns + legal row
    ├── three/
    │   ├── CanopyTree.jsx        ← low-poly 3D tree geometry + growth logic
    │   └── TreeCanvas.jsx        ← <Canvas> wrapper: camera, lighting, Suspense
    ├── hooks/
    │   └── useScrollGrowth.js    ← window scroll position → 0–1 value
    ├── services/
    │   └── openMeteoAirQuality.js ← fetch wrapper + friendly error messages
    └── data/
        └── airQualityLocations.js ← the ~18 cities checked (name, flag, lat/lon)
```

---

## 🎨 Design system (quick reference)

Defined in `src/index.css` under `@theme` — change values there and they
propagate everywhere via Tailwind's arbitrary-value syntax (e.g. `bg-(--color-forest)`).

- **Colors:** pale sage background, deep forest green as the primary brand
  color, soft leaf green as secondary accent, sunlight gold as the CTA/highlight color.
- **Type:** `Fraunces` (serif) for headings, `Inter` for body copy,
  `IBM Plex Mono` for small labels and data figures.

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

## 🕓 Project history

- **Task 1 — Responsive UI from a design brief:** built the full landing page
  (hero, trust bar, stats, features, how-it-works, dashboard preview,
  testimonial, CTA, footer) with the 3D growing tree as the signature element.
- **Task 2 — Consume a public API:** originally integrated the Electricity
  Maps API for live grid carbon intensity. Switched to the Open-Meteo Air
  Quality API after the Electricity Maps free-tier key turned out to be
  scoped to a single country, which didn't suit a multi-country list/search
  demo. The current Air Quality section requires no signup or key at all.
- **Branding pass:** replaced the default Vite favicon with a custom Canopy
  leaf mark.
- **Deployment:** shipped to Vercel.
