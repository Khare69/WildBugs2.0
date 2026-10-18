# 🪲 WildBugs 2.0

> A citizen science platform to identify insects via AI, map regional biodiversity with interactive geospatial heatmaps, earn badges, and collaborate with community experts.

[![Repository](https://img.shields.io/badge/GitHub-WildBugs2.0-blue?logo=github)](https://github.com/Khare69/WildBugs2.0.git)
[![Architecture Plan](https://img.shields.io/badge/Plan-architecture__plan.md-success)](./architecture_plan.md)
[![Progress Report](https://img.shields.io/badge/Audit-PROGRESS__REPORT.md-orange)](./PROGRESS_REPORT.md)

---

## 🧭 Repository Information

- **Remote Origin**: [`https://github.com/Khare69/WildBugs2.0.git`](https://github.com/Khare69/WildBugs2.0.git)
- **Branch**: `main`
- **Documentation Policy**: This `README.md` is updated after the completion of each implementation phase to document new features, API endpoints, environment variables, and setup instructions. Detailed audit logs are maintained in [`PROGRESS_REPORT.md`](./PROGRESS_REPORT.md).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Zustand, TanStack Query, Leaflet, `vite-plugin-pwa` |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, JWT Authentication, Multer |
| **Database & Cache** | PostgreSQL with PostGIS extension, Redis, BullMQ job queue |
| **External Services** | Google Cloud Vision API (Species ID), Cloudinary (Media storage & optimization) |
| **DevOps & Tooling** | Docker, Docker Compose, Zod (validation), ESLint, Prettier |

---

## 🗺️ Implementation Roadmap

| Phase | Milestone | Status | Key Deliverables |
|:---:|:---|:---:|:---|
| **Phase 1** | **Foundation** | ✅ Completed | Scaffolding, Prisma v6 schema, 30-species seed, JWT auth, species catalog & layout shell |
| **Phase 2** | **Core Upload Loop** | ✅ Completed | Media capture, Cloudinary pipeline, async Cloud Vision AI worker, discovery view |
| **Phase 3** | **Biodiversity Map** | ✅ Completed | PostGIS spatial queries, interactive Leaflet map, clustering, density heatmap |
| **Phase 4** | **Engagement & Gamification** | ⏳ Upcoming | User profiles, field journal, streak engine, automated badges, seasonal challenges |
| **Phase 5** | **Community & Moderation** | ⏳ Upcoming | Forum threads, expert verification system, notification bell with polling |
| **Phase 6** | **Polish, Hardening & Deployment** | ⏳ Upcoming | PWA offline sync, Redis caching, rate limiting, Docker containerization, health probes |

---

## 🗺️ Phase 3 Features & Architecture

### Geospatial Backend & Spatial Queries (`wildbugs-backend/`)
- **GeoJSON Bounding Box API (`/api/map/sightings`)**:
  - Implements RFC 7946 standard `FeatureCollection` bounded by `minLat`, `maxLat`, `minLng`, `maxLng`.
  - Point coordinates serialized in standard `[longitude, latitude]` format.
  - Rich feature properties: species name, scientific name, family, thumbnail, status, AI confidence, observation timestamp, observer name.
  - Supports filtering by `speciesId`, `dateFrom`, and `dateTo`.
  - Antimeridian wrap-around handling using Boolean `OR` logic for Pacific coordinate spans.
- **Heatmap Density Aggregation (`/api/map/heatmap`)**:
  - Aggregates sightings on the fly into configurable spatial grid cells (~0.01° ≈ 1.1 km).
  - Sanitizes floating-point precision artifacts and calculates intensity weights.
  - Returns formatted `[latitude, longitude, intensity]` tuples ready for Leaflet-heat layers.
- **Strict Query Validation**: Zod schema boundary checking (-90/90 lat, -180/180 lng, 0.001/1.0 grid size) and cross-field refinements (`minLat <= maxLat`, `dateFrom <= dateTo`).

#### API Reference (Geospatial Endpoints)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/map/sightings` | GeoJSON FeatureCollection bounded by `minLat`, `maxLat`, `minLng`, `maxLng` with species & date filters | No |
| `GET` | `/api/map/heatmap` | Spatial grid density points `[lat, lng, intensity]` with bounding box and species filters | No |

---

### Interactive Biodiversity Map UI (`wildbugs-frontend/`)
- **Full-Screen Leaflet Map (`/map`)**: Leaflet `MapContainer` with OpenStreetMap tile layer, persistent viewport state, and dynamic bounding box listener (`moveend`).
- **Marker Clustering Layer (`MarkerCluster.tsx`)**: High-performance grouping of dense observation markers at lower zoom levels with glowing cluster badges and smooth spiderfy animations.
- **Toggleable Heatmap Layer (`HeatmapLayer.tsx`)**: Multi-tier density color gradient visualizing regional biodiversity hotspots via `leaflet.heat`.
- **Collapsible Filter Drawer (`MapFilters.tsx`)**: Floating panel with layer switcher (Pins vs Heatmap), species dropdown selector, date range picker, and quick presets.
- **Custom Insect Pin Markers (`SightingMarker.tsx`)**: Custom `L.divIcon` markers with glowing circular halos, insect emoji badge, and status indicator dots. Rich popups linking to discovery detail.
- **Persistent Viewport Store (`mapStore.ts`)**: Zustand store persisting viewport coordinates and filters across navigation.
- **Automated Test Coverage**: 85 automated unit and integration tests passing across full stack (50 backend, 35 frontend).

---

## 📸 Phase 2 Features & Architecture

### Backend Media Ingestion & AI Pipeline (`wildbugs-backend/`)
- **Multer Memory Storage**: In-memory streaming buffer handling photo uploads up to 10MB with strict MIME filtering (`image/jpeg`, `image/png`, `image/webp`).
- **Cloudinary CDN Integration**: Direct buffer streaming to Cloudinary with automatic 300x300 thumbnail generation and fallback mocks for local test environments.
- **BullMQ + Redis Background Processing**:
  - Configured resilient Redis connection (`maxRetriesPerRequest: null`) with exponential reconnection backoff.
  - Dedicated `identification` job queue orchestrating background AI classification upon sighting creation.
- **Google Cloud Vision AI Worker**:
  - Image annotation pipeline extracting morphological labels and confidence metrics.
  - Weighted species matcher ranking catalog matches against common names, scientific names, and taxonomic families.
  - Automatic status updates (`PENDING` -> `IDENTIFIED` or `UNIDENTIFIED`) and audit trail creation in `identifications` table.
- **Automated Test Coverage**: 30 backend unit and integration tests covering image uploading, queue configuration, and AI classification logic (`npm test`).

#### API Reference (Sighting Endpoints)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/sightings` | Upload photo & GPS coordinates (`photo`, `latitude`, `longitude`, `speciesId`, `observedAt`) | Yes (Bearer) |
| `GET` | `/api/sightings/:id` | Detailed sighting with observer, species, and identification history | No |
| `GET` | `/api/sightings/me` | Paginated sighting history for authenticated observer (`?page=&limit=`) | Yes (Bearer) |
| `GET` | `/api/sightings` | Recent public observation sightings feed (`?limit=`) | No |

---

### Frontend Observation & Discovery Experience (`wildbugs-frontend/`)
- **Client-Side Image Preprocessing**: HTML5 Canvas utility resizing high-resolution phone camera photos (up to 20MB) down to optimized JPEGs (300–600KB, max 2048px), saving over 80% bandwidth before transmission.
- **Mobile Camera Capture (`useCamera`)**: Full camera stream viewfinder with front/rear camera switching, video frame capture, and fallback to local file browser.
- **Geolocation Integration (`useGeolocation`)**: Automatic device GPS location detection with precision readouts (±meters), coordinate bounds checking (-90/90, -180/180), and sample coordinate presets.
- **Upload Wizard (`/upload`)**: 5-step intuitive flow (Capture → Preview & Compression Stats → Location & Observation Details → Progress Feedback → Success & AI Result Link).
- **Observation Detail View (`/sightings/:id`)**:
  - Dynamic 3-second polling on `PENDING` observations until Google Cloud Vision classification finishes.
  - Visual AI confidence meter (High / Moderate / Review Needed).
  - High-res photo viewer with observer attribution and OpenStreetMap link.
  - Complete ecological profile (habitat, diet, lifecycle) populated when species is classified.
  - "Suggest Species Correction" modal for community and expert input.
- **Automated Test Coverage**: 19 frontend unit tests verifying image compression, upload store state, and identification calculations (`npm test`).

---

## 🏗️ Phase 1 Features & Architecture

### Backend API (`wildbugs-backend/`)
- **Express + TypeScript** server with configurable CORS from `CORS_ORIGIN`, JSON body-parser with malformed JSON syntax error trapping, and centralized `AppError` handling.
- **Prisma v6 LTS ORM** with PostgreSQL schema supporting `User`, `Species`, `Sighting`, `Identification`, `Badge`, and `UserBadge`.
- **Database Error Handling**: Global error pipeline maps `PrismaClientKnownRequestError` (`P2002` -> 409 Conflict, `P2025` -> 404 Not Found) and connection initialization errors (503 Service Unavailable).
- **Database Seeder**: 30 realistic insect species across 6 taxonomic orders with complete scientific names, descriptions, habitats, diets, and conservation statuses.
- **Authentication**: Bcryptjs password hashing (10 salt rounds), JWT signing with configurable expiration, and `authenticate` bearer middleware with whitespace-safe token extraction.
- **Species Catalog API**: Paginated listing with search across common/scientific names and habitat, trimmed family filtering, conservation status filtering, and individual profile lookups.
- **Strict Validation**: All incoming requests validated at the controller boundary using **Zod** with whitespace sanitization.

#### API Reference (Phase 1 Endpoints)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health probe | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate with credentials and receive JWT | No |
| `GET` | `/api/auth/me` | Retrieve current authenticated user profile & observation stats | Yes (Bearer) |
| `GET` | `/api/species` | Paginated catalog (`?search=&family=&conservationStatus=&page=&limit=`) | No |
| `GET` | `/api/species/families` | Distinct taxonomic families with species counts | No |
| `GET` | `/api/species/:id` | Detailed species biological profile | No |

---

### Frontend Application (`wildbugs-frontend/`)
- **Vite + React 18 + TypeScript** with fast HMR and optimized production bundling.
- **Persistent Auth Session**: Global session managed via **Zustand** with `persist` middleware in `localStorage` (`wildbugs_auth_session`), keeping observer sessions intact across page refreshes with automatic `/api/auth/me` validation on startup.
- **Axios Client**: Automatic Bearer token injection and global 401 unauthenticated response handling with automatic session cleanup.
- **TanStack Query (React Query)**: Asynchronous server state caching, pagination handling, and retry logic.
- **Responsive Layout Shell**: Sticky glassmorphic `Navbar`, mobile `BottomNav` bar (with quick access to Home, Catalog, and Account), and modern footer.
- **Observer Account Dashboard**: Dedicated protected `/account` view showing observer profile details, role chip, and real-time counts for field sightings, taxonomic identifications, and badges.
- **Species Catalog UI**: Searchable grid with family pills, conservation status badges, loading skeletons, and profile views.
- **Dark Forest Design System**: Modern aesthetic with glowing emerald accents, glassmorphic card panels, and responsive grid layouts.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0+ (v20+ LTS / Node 22 recommended)
- **PostgreSQL**: v15+ (with PostGIS extension enabled)

### 2. Backend Setup
```bash
cd wildbugs-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env to set your PostgreSQL connection string and JWT secret

# Generate Prisma Client & Run Seeder
npx prisma generate
npx prisma db push
npm run prisma:seed

# Run Automated Test Suite
npm test

# Start development server
npm run dev
# The API will be live at http://localhost:3001
```

### 3. Frontend Setup
```bash
cd wildbugs-frontend

# Install dependencies
npm install

# Run Linter & Type Check
npm run lint

# Start Vite development server
npm run dev
# The UI will be live at http://localhost:5173
```

---

## 📜 Development & Git Protocol

1. **Sub-Task Atomic Commits**: Every sub-task is verified and followed immediately by an atomic git commit:
   ```bash
   git add .
   git commit -m "<type>(<scope>): <summary>"
   ```
2. **Sub-Phase & Phase Progress Tracking**: Detailed logs of changes performed, bugs discovered, errors resolved, and methods refactored are recorded in [`PROGRESS_REPORT.md`](./PROGRESS_REPORT.md).
3. **Iterative Bug Sweep & Resolution Quality Gate (Zero-Bug Policy)**:
   - At the completion of each phase, perform a thorough end-to-end audit of all endpoints, queries, logs, and UI states.
   - Fix all bugs immediately. If an approach is fragile, defective, or slow, **replace or refactor it with a superior approach**.
   - **Test repeatedly again and again** until all components function with zero runtime or logical errors.
4. **Phase Wrap-Up & Remote Push**:
   ```bash
   git add .
   git commit -m "docs: complete Phase X bug audit, progress report, and readme"
   git push origin main
   ```
