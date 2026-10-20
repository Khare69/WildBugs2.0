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
| **Phase 4** | **Engagement & Gamification** | ✅ Completed | User profiles, field journal, streak engine, automated badges, seasonal challenges |
| **Phase 5** | **Community & Moderation** | ✅ Completed | Forum threads, expert verification system, notification bell with polling |
| **Phase 6** | **Polish, Hardening & Deployment** | ✅ Completed | PWA offline sync, Redis caching, rate limiting, Docker containerization, health probes |

---

## 🚀 Phase 6 Features & Architecture: Polish, Hardening & Deployment

### 1. Progressive Web App (PWA) & Offline Sync
- **Service Worker & Precaching (`vite-plugin-pwa`)**:
  - Automatically installs and registers service worker with `autoUpdate` lifecycle.
  - Precaches all application shell assets, static HTML, CSS bundles, vector graphics, and Webpack/Vite chunks (`dist/sw.js`).
  - Runtime caching rules:
    - **API Routes**: `NetworkFirst` strategy with 10-second timeout, falling back gracefully to cached responses when in remote field areas without signal.
    - **Cloudinary Imagery**: `CacheFirst` strategy with 30-day expiration and LRU cache rotation.
- **IndexedDB Observation Queue (`useOfflineQueue`)**:
  - Offline field observations (photo binary blobs, precise GPS coordinates, observation timestamp, notes) are stored in client-side IndexedDB via `idb-keyval`.
  - Transparent in-memory fallback for environments with restricted browser storage.
  - Automatic reconnection listener (`window.addEventListener('online')`) detects signal recovery and automatically processes queued uploads in the background.
  - UI status indicators display queue size and notify the observer when records are safely pending or completed.

### 2. High-Performance Redis Caching & Write Invalidation
- **Centralized Cache Manager (`cacheService.ts`)**:
  - Standardized Redis key management with JSON serialization and configurable TTLs.
  - Seamless memory degradation: if Redis is disconnected or rebooting, the backend automatically falls back to an internal in-memory store without failing requests.
  - Pattern-based wildcard cache invalidation (`delPattern`) using Redis `SCAN`.
- **Cached Layers**:
  - `speciesService.ts`: Species catalog and species details cached for **1 hour** (3600s).
  - `userService.ts`: Global leaderboard rankings cached for **15 minutes** (900s).
  - `mapService.ts`: Geospatial sightings GeoJSON and heatmaps cached for **5 minutes** (300s).
  - `sightingService.ts`: Creates write invalidation hooks clearing `map:*`, `leaderboard:*`, and `stats:*` upon successful observation uploads.

### 3. Tiered Security Rate Limiting & User Feedback
- **DDoS & Abuse Protection (`rateLimiter.ts`)**:
  - **General API Limiter**: 100 requests per minute per IP across all `/api` routes.
  - **Authentication Limiter**: 5 login/registration attempts per 15 minutes per IP (mitigates brute-force attacks).
  - **Upload Limiter**: 20 observations per hour per authenticated user account (prevents spam uploads and API quota exhaustion).
- **Global Toast Notification Container (`Toast.tsx`)**:
  - Non-blocking slide-in notifications with auto-dismiss after 5 seconds.
  - Semantic variants: `success` (emerald), `error` (rose), `warning` (amber), `info` (cyan).
  - Wired into Axios response interceptors (`client.ts`) to inform observers when rate limits are approached (429) or sessions expire (401).

### 4. Production Containerization & Orchestration
- **Multi-Stage Dockerfile (`wildbugs-backend/Dockerfile`)**:
  - **Builder Stage**: Installs dependencies, generates Prisma client models, and compiles TypeScript into lean `dist/`.
  - **Runner Stage**: Minimal Node.js 20 Alpine image containing only production dependencies and compiled JavaScript.
  - Hardened with a non-root system user (`wildbugs:nodejs`, UID 10001) adhering to container security best practices.
  - Embedded container `HEALTHCHECK` probing `/api/health`.
- **Docker Compose Topology (`docker-compose.yml`)**:
  - Orchestrates 3 production services on isolated bridge network `wildbugs-network`:
    1. `postgres`: PostgreSQL 15 with PostGIS spatial extension (`postgis/postgis:15-3.3-alpine`) and healthcheck.
    2. `redis`: Redis 7 Alpine (`redis:7-alpine`) with healthcheck and persistent cache volume.
    3. `backend`: WildBugs backend API built from multi-stage Dockerfile, gated on PostgreSQL and Redis readiness.
- **Deep Health Check Probe (`GET /api/health`)**:
  - Probes live PostgreSQL database connectivity (`SELECT 1`) and Redis cache connection (`ping()`).
  - Returns HTTP 200 with `{ status: 'healthy', db: true, redis: true, service: 'wildbugs-api', timestamp: '...' }` when operational, or HTTP 503 degraded when a dependency is unreachable.
- **SPA Deployment Configurations**:
  - `wildbugs-frontend/vercel.json`: Vercel SPA rewrite rule (`/(.*)` -> `/index.html`) with immutable asset caching.
  - `wildbugs-frontend/public/_redirects`: Static fallback rewrite (`/* /index.html 200`) for Netlify and Cloudflare Pages.

---

## 👥 Phase 5 Features & Architecture: Community, Expert Verification & Notifications

### 1. Community Discussion Forum
- **Hierarchical Threaded Discussions (`/forum`, `/forum/:id`)**:
  - Prisma relational `ForumPost` schema supporting top-level threads and recursive replies (`parentId`).
  - High-performance recursive tree-builder transforming flat relational queries into conversational reply trees with zero N+1 database overhead.
  - Optional species cross-tagging linking forum threads directly to biological catalog entries.
  - Optimistic client-side upvoting mechanism with instant UI feedback.
- **Rich Markdown Editor (`ForumEditor.tsx`)**:
  - Live markdown preview mode toggle with markdown syntax rendering.
  - Formatting toolbar shortcuts for bold, italic, inline code, blockquote, and list items.
  - Character validation and error boundaries preventing empty submissions.

### 2. Expert Verification System
- **Role-Based Access Control (`authorize` Middleware)**:
  - Enterprise RBAC middleware restricting verification endpoints to users with `EXPERT` or `ADMIN` roles.
  - Returns structured `InsufficientPermissionsError` (403 Forbidden) for unauthorized accounts.
- **Expert Review Desk (`ExpertReviewControls.tsx`)**:
  - Interactive management console on `SightingDetailPage.tsx` visible exclusively to accredited experts and administrators.
  - **Verify Workflow**: Sets sighting status to `VERIFIED`, attaches verified identification record, and automatically triggers an observer reward notification.
  - **Reject Workflow**: Sets status to `REJECTED` and notifies observer with constructive identification feedback.
- **Official Verification Seal (`ExpertVerifyBadge.tsx`)**:
  - Glowing emerald verified stamp badge affixed to observation headers with expert attribution metadata.

### 3. Real-Time Notification Engine
- **Event-Driven Notification Generation (`notificationService.ts`)**:
  - Automatically dispatches in-app notifications on key platform events:
    - Sighting verified by accredited expert.
    - Sighting rejected with identification feedback.
    - Milestone badge unlocked.
    - Seasonal BioBlitz challenge milestone achieved.
- **Polling Navbar Bell (`NotificationBell.tsx`)**:
  - TanStack Query polling every 30 seconds (`refetchInterval: 30000`), dynamically gated on active authentication session.
  - Glowing red unread badge counter with pulse animation.
  - Interactive popover listing recent notifications with categorical iconography, relative time formatting (`Just now`, `5m ago`), and direct navigation links.
  - Individual "mark read" and global "mark all read" actions.

#### API Reference (Community, Verification & Notification Endpoints)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/forum/posts` | Paginated forum threads listing with species and search filtering | No |
| `GET` | `/api/forum/posts/:id` | Full discussion thread with complete recursive reply tree | No |
| `POST` | `/api/forum/posts` | Create top-level discussion thread (`title`, `body`, `speciesId`) | Yes (Bearer) |
| `POST` | `/api/forum/posts/:id/reply` | Reply to an existing discussion thread or comment (`body`) | Yes (Bearer) |
| `POST` | `/api/forum/posts/:id/upvote` | Atomic upvote increment on a discussion post | Yes (Bearer) |
| `PUT` | `/api/sightings/:id/verify` | Verify sighting, set status to `VERIFIED`, and notify uploader | Yes (EXPERT/ADMIN) |
| `PUT` | `/api/sightings/:id/reject` | Reject sighting, set status to `REJECTED`, and notify uploader | Yes (EXPERT/ADMIN) |
| `GET` | `/api/notifications` | Paginated notification stream for authenticated user | Yes (Bearer) |
| `GET` | `/api/notifications/unread-count` | Lightweight unread notification count for navbar badge polling | Yes (Bearer) |
| `PUT` | `/api/notifications/:id/read` | Mark individual notification as read | Yes (Bearer) |
| `PUT` | `/api/notifications/read-all` | Mark all notifications for authenticated user as read | Yes (Bearer) |

---

## 🏆 Phase 4 Features & Architecture: Engagement & Gamification

### 1. User Profiles & Chronological Field Journal
- **Naturalist Profile (`/api/users/me`, `/api/users/:id`)**:
  - Aggregates comprehensive observer statistics: total sightings, unique cataloged species, verified records count, precision accuracy rate, and active/longest observation streaks.
- **Paginated Field Journal (`/api/users/:id/journal`)**:
  - Delivers a reverse-chronological observation timeline with species details, taxonomic family chips, coordinates, and verification tags.
  - Interactive infinite scrolling and page pagination support.

### 2. Habit Tracking & Redis-Cached Leaderboards
- **Consecutive Observation Streak Engine**:
  - Pure calculation algorithm determining active daily observation streaks and personal records.
  - 7-day visual dot matrix tracker with animated flame badges.
- **High-Performance Leaderboards (`/api/users/leaderboard`)**:
  - Caches platform-wide rankings in Redis with a 15-minute TTL and transparent database fallback.
  - Three distinct ranking metrics: **Most Sightings** (🔭), **Unique Species** (🐞), and **Top Verifiers** (🛡️).
  - 3D visual podium for the top 3 observers (🥇 Champion, 🥈 Runner-up, 🥉 3rd Place) with observer role badges.

### 3. Automated Milestone Badge Engine
- **Achievement Catalogue**: Includes platform achievements such as `First Sighting` (🧭), `Biodiversity Explorer` (🦋), `Century Club` (💯), `Night Owl` (🦉), `Early Bird` (🌅), `Week Warrior` (🔥), and `Master Verifier` (🛡️).
- **Asynchronous BullMQ Evaluation**: Evaluates milestone criteria asynchronously on every new sighting ingestion without delaying HTTP responses.
- **Interactive Trophy Grid (`/api/users/:id/badges`)**:
  - Real-time progress percentages, target thresholds, and unlocked dates.
  - Unlocked glowing emerald medals, locked greyscale styling with progress bars, filter tabs, and modal requirement inspector.

### 4. Seasonal BioBlitz Challenges
- **Prisma Relational Models**: `Challenge` and `ChallengeProgress` tables with composite uniqueness `[challengeId, userId]`.
- **BioBlitz Participation API (`/api/challenges`, `/:id/join`, `/:id/progress`)**:
  - Active challenges catalog annotated with remaining days and enrollment counts.
  - One-click challenge join with immediate backfill from eligible field sightings recorded during the quest window.
  - Automatic progress updates triggered via background workers.
- **Seasonal Challenges UI (`/challenges`)**:
  - Filterable by `All`, `Active`, `Joined`, and `Completed`.
  - Accessible animated `<ProgressBar />` component and interactive `<ChallengeCard />` with countdown timers and status chips.

#### API Reference (Engagement & Gamification Endpoints)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated user profile, discovery stats, and streak metrics | Yes (Bearer) |
| `GET` | `/api/users/:id` | Public profile and stats for any observer | No |
| `GET` | `/api/users/:id/journal` | Paginated chronological observation field journal | No |
| `GET` | `/api/users/leaderboard` | Top naturalists ranked by sightings, species, or verified records (Redis 15m) | No |
| `GET` | `/api/users/:id/badges` | Platform achievements with user earned status and criteria progress | No |
| `GET` | `/api/challenges` | Active and upcoming seasonal bioblitz challenges with user progress | Optional |
| `GET` | `/api/challenges/:id` | Single challenge details and participant counts | Optional |
| `POST` | `/api/challenges/:id/join` | Enroll authenticated naturalist in a seasonal challenge | Yes (Bearer) |
| `GET` | `/api/challenges/:id/progress` | User's progress in a specific seasonal challenge | Yes (Bearer) |

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

### 4. Docker Compose Production Quickstart
Spin up the complete multi-container stack (PostgreSQL with PostGIS, Redis, and WildBugs API) with a single command:

```bash
# Build and launch all services in detached mode
docker-compose up --build -d

# Check container health and status
docker-compose ps

# Verify API and dependency health
curl http://localhost:3001/api/health
```

### 5. Running the Full Automated Test Suite
```bash
# Backend test suite (116 tests across 26 suites)
cd wildbugs-backend && npm test

# Frontend test suite (70 tests across 20 suites)
cd ../wildbugs-frontend && npm test
```

---

## 🔐 Environment Variables Matrix

### Backend (`wildbugs-backend/.env`)
| Variable | Required | Default | Description |
|---|:---:|---|---|
| `PORT` | No | `3001` | HTTP server listening port |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `test`, `production`) |
| `DATABASE_URL` | **Yes** | — | PostgreSQL PostGIS connection string |
| `JWT_SECRET` | **Yes** | — | Min 16-character cryptographic signing secret |
| `JWT_EXPIRES_IN` | No | `7d` | JSON Web Token lifespan |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (comma-separated or `*`) |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URI for caching and job queues |
| `CLOUDINARY_CLOUD_NAME` | No | `""` | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | No | `""` | Cloudinary API access key |
| `CLOUDINARY_API_SECRET` | No | `""` | Cloudinary API secret |

### Frontend (`wildbugs-frontend/.env`)
| Variable | Required | Default | Description |
|---|:---:|---|---|
| `VITE_API_URL` | No | `http://localhost:3001` | Base URL for backend API requests |

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
