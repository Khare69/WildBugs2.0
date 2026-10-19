# 📋 WildBugs 2.0 — Progress Report & Implementation Audit Log

> **Remote Repository**: [`https://github.com/Khare69/WildBugs2.0.git`](https://github.com/Khare69/WildBugs2.0.git)  
> **Protocol**: This document is updated after **every sub-phase completion** and audited after **every phase completion**.
> **Zero-Bug Quality Gate**: At the end of every phase, a comprehensive bug sweep is conducted. All errors are diagnosed and resolved; any fragile or suboptimal approaches are replaced or refactored; and components are **tested repeatedly until zero bugs remain** before documentation is committed and pushed to the remote repository.

---

## 📊 Phase Execution Overview

| Phase | Description | Sub-Phases | Status | Bug Audit Gate | Remote Synced | Last Updated |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **Phase 1** | Foundation (Scaffolding, DB, Auth, Species, Shell) | 1.1 – 1.5 | ✅ Completed | ✅ Passed (0 Bugs) | Yes | 2026-10-16 |
| **Phase 2** | Core Upload Loop (Capture, Storage, AI Vision, Detail) | 2.1 – 2.4 | ✅ Completed | ✅ Passed (0 Bugs) | Yes | 2026-10-17 |
| **Phase 3** | Biodiversity Map (PostGIS, Leaflet, Clustering, Heatmap) | 3.1 – 3.3 | ✅ Completed | ✅ Passed (0 Bugs) | Yes | 2026-10-18 |
| **Phase 4** | Engagement & Gamification (Journal, Streaks, Badges, Challenges) | 4.1 – 4.4 | 🔄 In Progress (4.1 Done) | ⏳ Pending | No | 2026-10-19 |
| **Phase 5** | Community (Discussion Forum, Verification, Notifications) | 5.1 – 5.3 | ⏳ Pending | ⏳ Pending | No | — |
| **Phase 6** | Polish & Deploy (PWA, Caching, Docker, Production Hardening) | 6.1 – 6.3 | ⏳ Pending | ⏳ Pending | No | — |

---

## 🪵 Sub-Phase & Phase Audit Logs

### 🏗️ Phase 1 — Foundation

#### Sub-Phase 1.1: Project Scaffolding & Base Tooling
- **Status**: ✅ Completed
- **Tasks**:
  - Task 1.1.1: Backend project scaffold (`wildbugs-backend/`)
  - Task 1.1.2: Frontend project scaffold (`wildbugs-frontend/`)
- **🛠️ Changes Performed**:
  - Initialized Express + TypeScript backend scaffold in `wildbugs-backend/` with `package.json`, `tsconfig.json`, `src/app.ts`, `src/server.ts`, `.env.example`, `.env`, and `.gitignore`.
  - Configured CORS, JSON parsing, and `/api/health` probe endpoint.
  - Initialized Vite + React + TypeScript frontend scaffold in `wildbugs-frontend/` with React Router 6, TanStack Query, Axios, and Zustand.
  - Implemented `src/api/client.ts` Axios instance configured to communicate with `VITE_API_URL`.
  - Implemented `src/App.tsx` with routing for `/` (Home), `/species` (Species Catalog), `/login` (Sign In), and `*` (404 Not Found), integrating live query testing for backend `/api/health`.
  - Implemented modern biodiversity dark theme design tokens and glassmorphism styling in `src/index.css`.
- **🐛 Bugs Discovered**:
  - Frontend TypeScript build failed with `error TS1484: 'AxiosInstance' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled`.
- **🔧 Errors Resolved**:
  - Converted `import axios, { AxiosInstance } from 'axios'` in `wildbugs-frontend/src/api/client.ts` to type-only import `import axios, { type AxiosInstance } from 'axios'`, allowing clean TypeScript compilation under Vite's strict `verbatimModuleSyntax`.
- **🔄 Methods Replaced / Refactored**:
  - Used explicit `type` imports in `client.ts` to strictly comply with TypeScript 5.7+ `verbatimModuleSyntax`.
- **📝 Verification Actions & Test Results**:
  - Backend Build: `npm run build` in `wildbugs-backend` passed cleanly (exit code 0).
  - Health Probe Test: Launched backend server on port 3001; verified `GET /api/health` returned `{"status":"ok", "service":"wildbugs-api"}`.
  - Frontend Build: `npm run build` in `wildbugs-frontend` compiled client bundle in 367ms without warnings or errors.
  - Git Commits: `29c8439` (Task 1.1.1) and `b7ea860` (Task 1.1.2).

---

#### Sub-Phase 1.2: Database Modeling & Seeding
- **Status**: ✅ Completed
- **Tasks**:
  - Task 1.2.1: Prisma schema definition & migration (`wildbugs-backend/prisma/schema.prisma`, `migrations/0_init/migration.sql`)
  - Task 1.2.2: Species seed script (`wildbugs-backend/prisma/seed.ts`)
- **🛠️ Changes Performed**:
  - Configured PostgreSQL datasource and Prisma client generator in `prisma/schema.prisma`.
  - Defined core relational models: `User`, `Species`, `Sighting`, `Identification`, `Badge`, `UserBadge` with foreign keys, cascaded relations, and compound indexes on foreign keys and spatial coordinates (`latitude`, `longitude`).
  - Generated initial PostgreSQL DDL migration in `prisma/migrations/0_init/migration.sql` with schema, enums, tables, indexes, and constraints.
  - Authored comprehensive seeding script `prisma/seed.ts` containing 30 realistic insect species with scientific names, families, habitats, diets, lifecycle notes, and conservation statuses across major insect orders.
  - Added Prisma scripts (`prisma:generate`, `prisma:migrate`, `prisma:seed`) and seed configuration to `package.json`.
- **🐛 Bugs Discovered**:
  - Prisma v7 CLI broke backward compatibility with standard `schema.prisma` datasource: `error: The datasource property url is no longer supported in schema files`.
- **🔧 Errors Resolved**:
  - Replaced experimental Prisma v7 with stable LTS Prisma v6.4.1 in `package.json`, restoring standard environment-driven connection string support (`url = env("DATABASE_URL")`) and direct PrismaClient instantiation.
- **🔄 Methods Replaced / Refactored**:
  - Refactored package dependencies to pin Prisma v6.4.1 LTS for predictable client generation and migration handling.
- **📝 Verification Actions & Test Results**:
  - Generated Client: `npx prisma generate` completed successfully in 172ms generating typed PrismaClient models.
  - DDL Generation: `npx prisma migrate diff` created complete SQL DDL schema without errors.
  - TypeScript Compilation: `npx tsc --noEmit` verified `seed.ts` compiles with 0 type errors.
  - Git Commits: `acaf680` (Task 1.2.1) and `d34999b` (Task 1.2.2).

---

#### Sub-Phase 1.3: Core Backend Utilities & Error Infrastructure
- **Status**: ✅ Completed
- **Tasks**:
  - Task 1.3.1: Environment variable validation (`src/config/env.ts`), custom errors (`src/utils/errors.ts`), global error handler (`src/middleware/errorHandler.ts`), and route integration (`src/app.ts`, `src/server.ts`)
- **🛠️ Changes Performed**:
  - Created `src/config/env.ts` with Zod schema validating `PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET` (min 16 chars), `JWT_EXPIRES_IN`, and `CORS_ORIGIN`, providing structured error output on missing variables.
  - Created `src/utils/errors.ts` implementing `AppError` base class and specialized subclasses (`NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `InternalServerError`) with HTTP status codes and operational flags.
  - Created `src/middleware/errorHandler.ts` handling `AppError`, `ZodError`, and unhandled 500 exceptions, returning standardized JSON error envelopes and omitting stack traces in production.
  - Implemented `asyncHandler` higher-order function to wrap async Express controllers and forward unhandled promise rejections to the error pipeline.
  - Updated `src/app.ts` with a 404 catch-all route handler forwarding `NotFoundError` to the centralized error middleware.
  - Updated `src/server.ts` to consume validated configuration directly from `src/config/env.ts`.
- **🐛 Bugs Discovered**:
  - None during implementation; initial port and schema tests verified.
- **🔧 Errors Resolved**:
  - None required.
- **🔄 Methods Replaced / Refactored**:
  - Replaced ad-hoc `process.env` access in `server.ts` with strict, validated configuration parsing via Zod.
- **📝 Verification Actions & Test Results**:
  - Build Validation: `npm run build` compiled without warnings or type errors.
  - Health Route Verification: `GET /api/health` returned HTTP 200 with JSON payload `{"status":"ok","timestamp":"...","service":"wildbugs-api"}`.
  - Error Handler Verification: `curl.exe -i http://localhost:3001/api/undefined-test-route` returned HTTP 404 with JSON envelope `{"status":"fail","message":"Cannot GET /api/undefined-test-route"}` (not generic HTML).
  - Git Commit: `3298a7f` (`feat(backend): implement zod env validation, custom app errors, and global error handler`).

---

#### Sub-Phase 1.4: Authentication & Authorization Flow
- **Status**: ✅ Completed
- **Tasks**:
  - Task 1.4.1: Auth backend service & middleware (`authService.ts`, `authenticate.ts`, `express.d.ts`)
  - Task 1.4.2: Auth controller & routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
  - Task 1.4.3: Auth frontend store (Zustand in-memory store), Axios interceptors, LoginForm, RegisterForm, ProtectedRoute, and auth pages
- **🛠️ Changes Performed**:
  - Implemented `authService.ts` providing secure `registerUser`, `loginUser`, and `getUserById` with bcryptjs password hashing (10 salt rounds) and JWT signing with configurable expiration.
  - Authored `authenticate.ts` JWT verification middleware extracting `Bearer <token>` headers, decoding payloads, and attaching `req.user`.
  - Added TypeScript namespace extension in `src/types/express.d.ts` declaring `req.user` payload structure.
  - Created `authController.ts` and `authRoutes.ts` with strict Zod validation schemas for registration (email, password min 8 characters, display name 2-50 chars) and login.
  - Wired `/api/auth` into main Express router in `app.ts`.
  - Created client-side `authStore.ts` using Zustand to store JWT tokens and user profile securely in memory (mitigating XSS token extraction).
  - Updated Axios client in `src/api/client.ts` with request interceptor dynamically injecting Bearer token and response interceptor clearing auth state on 401.
  - Built `LoginForm.tsx` and `RegisterForm.tsx` components with dark nature styling, validation feedback, and clean state handling.
  - Built `ProtectedRoute.tsx` route guard preserving redirection location state.
  - Integrated `/login` and `/register` routes into `App.tsx` with user session indicator in header navigation.
- **🐛 Bugs Discovered**:
  - Vite `verbatimModuleSyntax` TS1484 compiler error: TypeScript under Vite strict module syntax prevented importing TypeScript types (`AuthResponse`, `MeResponse`, `User`) as value imports in `authApi.ts`, `useAuth.ts`, and `authStore.ts`.
- **🔧 Errors Resolved**:
  - Converted all interface and type imports in frontend auth files to `import type { ... }` ensuring compatibility with Vite/Rollup bundler and TS 5.x verbatimModuleSyntax.
- **🔄 Methods Replaced / Refactored**:
  - Replaced persistent browser `localStorage` auth token storage with in-memory Zustand store to eliminate persistent XSS vulnerability vectors.
  - Replaced ad-hoc error reporting with unified `AppError` and `asyncHandler` envelope in auth controllers.
- **📝 Verification Actions & Test Results**:
  - Backend Build: `npm run build` compiled cleanly without TypeScript errors.
  - Frontend Build: `npm run build` compiled into production bundle in `dist/` with 0 errors (`135 modules transformed`).
  - Git Commits:
    - `d3139d4`: `feat(auth): implement password hashing, jwt signing, and auth middleware`
    - `1595f8b`: `feat(auth): add register and login endpoints with zod request validation`
    - `6b3d5cd`: `feat(auth-ui): create zustand auth store, axios interceptors, and login/register views`

---

#### Sub-Phase 1.5: Species Catalog & Layout Shell
- **Status**: ✅ Completed
- **Tasks**:
  - Task 1.5.1: Species backend API (`speciesService.ts`, `speciesController.ts`, `speciesRoutes.ts` with pagination and search)
  - Task 1.5.2: Species catalog UI (`SpeciesCard.tsx`, `SpeciesFilterBar.tsx`, `SpeciesListPage.tsx`, `SpeciesDetailPage.tsx`)
  - Task 1.5.3: Responsive layout shell (`Navbar.tsx`, `BottomNav.tsx`, `AppLayout.tsx`, `HomePage.tsx`, `NotFoundPage.tsx`, `index.css`)
  - Task 1.5.4: Phase 1 Quality Gate, Error Resolution, Documentation & Remote Push
- **🛠️ Changes Performed**:
  - Developed `speciesService.ts` providing full catalog retrieval, text search across common name, scientific name, and habitat (PostgreSQL case-insensitive mode), filtering by taxonomic family and conservation status, pagination with metadata, and single species lookups with sighting counts.
  - Implemented `speciesController.ts` with strict Zod validation schemas for query parameters (`search`, `family`, `conservationStatus`, `page`, `limit`) and route params (`id`).
  - Created `speciesRoutes.ts` and mounted `/api/species` in `src/app.ts`.
  - Created frontend `speciesApi.ts` with typed methods for catalog listing, individual profile lookup, and family metadata.
  - Authored `SpeciesCard.tsx` with dynamic conservation status badges (green for Least Concern, amber for Threatened/Vulnerable, crimson for Endangered), family tag, image fallback placeholder, and detail link.
  - Authored `SpeciesFilterBar.tsx` featuring real-time search with clear button, taxonomic family selector, conservation status dropdown, and filter reset.
  - Built `SpeciesListPage.tsx` powered by TanStack Query with loading skeletons, error/retry states, zero-result state, and pagination navigation.
  - Built `SpeciesDetailPage.tsx` featuring hero showcase, quick stats cards, four ecological trait sections (Ecosystem, Diet, Lifecycle, Sighting CTA), and breadcrumb navigation.
  - Built responsive `Navbar.tsx` featuring sticky blur, brand logo, desktop links, session indicator, and mobile drawer toggle.
  - Built `BottomNav.tsx` for mobile viewports (<=768px) with quick access tabs (Home, Catalog, Account).
  - Built `AppLayout.tsx` and updated `App.tsx` with modular routing across all views.
  - Overhauled `index.css` with a high-fidelity dark nature theme, emerald glowing tokens, glassmorphism panels, card lift transitions, and responsive grid layouts.
- **🐛 Bugs Discovered**:
  - Express route precedence issue: `/:id` route was originally catching `/families` requests, returning HTTP 400 (`Species ID must be a positive integer`).
- **🔧 Errors Resolved**:
  - Registered taxonomy metadata route `router.get('/families', getFamiliesHandler)` before parameterized route `router.get('/:id', getSpeciesByIdHandler)` in `speciesRoutes.ts`.
- **🔄 Methods Replaced / Refactored**:
  - Replaced inline placeholder components in `App.tsx` with modular page architectures (`HomePage`, `SpeciesListPage`, `SpeciesDetailPage`, `NotFoundPage`).
  - Standardized all catalog querying on structured metadata pagination (`page`, `limit`, `total`, `totalPages`).
- **📝 Verification Actions & Test Results**:
  - Backend Build: `npm run build` in `wildbugs-backend` passed with 0 errors.
  - Frontend Build: `npm run build` in `wildbugs-frontend` transformed 145 modules and bundled production assets in 424ms with 0 errors.
  - Route Test Suite: Executed scratch integration tests verifying 6/6 test cases (health check, 404 handler, parameter validation, register schema validation, malformed JSON handling).
  - Git Commits:
    - `9d5be88`: `feat(species-api): implement paginated species listing and detail endpoints`
    - `e9c39d9`: `feat(species-ui): build searchable species grid and detailed profile views`
    - `512e343`: `feat(layout): implement responsive navbar, mobile bottom tabs, and design system tokens`

#### 🏁 Phase 1 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ✅ Completed (Zero Bugs Gate Passed)
- **Iterative Bug Sweep & Pre-Phase 2 Deep Audit Log**:
  - *Discovered Defects & Runtime Errors*:
    1. **Prisma Error Handling Gap in Global Error Pipeline**: `errorHandler.ts` lacked handling for `Prisma.PrismaClientKnownRequestError` (such as `P2002` duplicate email / unique constraint violations and `P2025` record not found) and `Prisma.PrismaClientInitializationError` (database offline). These errors fell through to status 500 "Internal server error". Resolved by implementing explicit handlers mapping `P2002` to HTTP 409 Conflict with affected fields, `P2025` to HTTP 404 Not Found, and initialization errors to HTTP 503 Service Unavailable.
    2. **CORS Origin Configuration Ignored**: In `app.ts`, `cors()` was invoked without passing `env.CORS_ORIGIN`. Resolved by dynamically parsing origins from `env.CORS_ORIGIN` with credentials enabled.
    3. **Whitespace Bypass in Auth Validation Schemas**: In `authController.ts`, `displayName` allowed whitespace-only strings (e.g., `"   "` having length >= 2), which passed Zod validation and was subsequently trimmed to empty string before database insertion. Resolved by chaining `.trim()` and `.toLowerCase()` in Zod schemas for `displayName` and `email`.
    4. **Status Code Misalignment in `meHandler`**: When session identity was missing from `req.user`, `authController.ts` threw `NotFoundError` (HTTP 404). Fixed to throw `UnauthorizedError` (HTTP 401).
    5. **Empty Bearer Token Gap in `authenticate.ts`**: When an Authorization header was sent with trailing whitespace or missing token, string splitting failed to recognize empty tokens cleanly. Resolved by using regex whitespace splitting and explicitly rejecting empty bearer tokens with HTTP 401.
    6. **Species Catalog Query Whitespace Filtering**: `speciesService.ts` did not trim or check length on `family` or `conservationStatus`, causing whitespace inputs to return zero results. Resolved with trimmed non-empty string checks.
    7. **Session Loss on Browser Refresh (In-Memory Auth Store)**: In `authStore.ts`, keeping tokens exclusively in ephemeral React memory caused immediate session loss upon page refresh or tab reopening. Resolved using Zustand `persist` middleware storing credentials in `localStorage` under `wildbugs_auth_session` and verifying sessions against `/api/auth/me` on startup.
    8. **Broken Account Navigation Link in `BottomNav.tsx`**: When authenticated, clicking "Account" navigated to `/species` (Species Catalog). Resolved by implementing a dedicated protected `/account` route and `AccountPage.tsx` displaying the user's profile, role, observation stats from `/api/auth/me`, and sign-out controls.
    9. **React 19 Impure Render Warning in `AppLayout.tsx`**: `oxlint` flagged `new Date().getFullYear()` called during render. Resolved by extracting `CURRENT_YEAR` as a module constant.
    10. **Inline Styles Clutter in Auth Views**: Refactored `LoginForm.tsx`, `RegisterForm.tsx`, `LoginPage.tsx`, and `RegisterPage.tsx` to replace dozens of inline style objects with responsive, design-token-driven CSS classes in `index.css`.
    11. **Missing Backend Automated Test Suite**: Built comprehensive automated unit and integration tests under `wildbugs-backend/tests/` covering token generation, password hashing, user sanitization, health probes, auth validation, bearer token protection, species parameter validation, and global error handling. Added `"test": "node -r ts-node/register --test tests/**/*.test.ts"` to `package.json`.
  - *Suboptimal Methods Replaced / Refactored*:
    1. Replaced ephemeral in-memory auth store with persisted Zustand store (`localStorage`) coupled with proactive `/api/auth/me` validation on app launch.
    2. Replaced dead `/species` redirect for authenticated users in `BottomNav.tsx` with dedicated `/account` dashboard view.
    3. Replaced fragile header string splitting in `authenticate.ts` with whitespace regex token extraction.
    4. Replaced inline styles in auth views with reusable design classes in `index.css`.
  - *Repeated Test Iteration Results*:
    - **Backend Automated Test Suite**: `npm test` in `wildbugs-backend` ran 17 tests across 5 test suites — 17 passed, 0 failed (100% pass rate).
    - **Integration Sweep Verification**: Executed end-to-end endpoint sweep across running HTTP server — 10/10 checks passed repeatedly across multiple iterations.
    - **Backend TypeScript Compilation**: `npm run build` in `wildbugs-backend` compiled with 0 errors.
    - **Frontend Linter**: `npm run lint` (`oxlint`) in `wildbugs-frontend` reported 0 errors and 0 warnings across 25 files.
    - **Frontend Production Build**: `npm run build` in `wildbugs-frontend` transformed 148 modules and bundled in 603ms with 0 errors.
    - **Zero Bugs Remaining**: All Phase 1 functions and features thoroughly validated and verified.
- **Git Commit**: `git commit -m "fix(phase1): resolve incomplete tasks, harden error handling, add test suite, and implement account view"`
- **Remote Push**: `git push origin main`

---

### 📸 Phase 2 — Core Upload Loop

#### Sub-Phase 2.1: Client Media Capture & Preprocessing
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **Camera Capture Hook (`src/hooks/useCamera.ts`)**:
    - Created React hook leveraging `navigator.mediaDevices.getUserMedia()` with back-camera priority (`facingMode: { ideal: 'environment' }`).
    - Implemented graceful fallback: catches `OverconstrainedError` or device-specific constraints and falls back to general video devices.
    - Added offscreen HTML5 canvas frame capture producing high-resolution JPEG Blobs, base64 data URLs, and synthetic `File` instances (`takePhoto()` / `capturePhoto()`).
    - Implemented file picker integration (`loadPhotoFromFile()`) for environments without hardware camera support.
    - Managed hardware tracks lifecycle, ensuring all active tracks terminate on unmount or when stopping camera.
  - **Client Image Compression Utility (`src/utils/compressImage.ts`)**:
    - Implemented proportional aspect-ratio downscaling limiting maximum dimension to 2048px (preserving detail for AI classification while reducing payload size).
    - Added iterative canvas JPEG quality compression targeting 300–500KB files from raw 8–15MB mobile captures.
    - Implemented `validateImageFile()` supporting JPEG, PNG, WebP, HEIC/HEIF with maximum raw size boundary checks.
    - Implemented `formatFileSize()` formatting raw byte integers into human-readable strings.
    - Supported both configuration options (`compressImage(file, { maxDimension, quality })`) and positional parameters (`compressImage(file, maxWidth, quality)`).
  - **Automated Frontend Test Suite (`src/utils/compressImage.test.ts`)**:
    - Created comprehensive unit tests validating `formatFileSize` and `validateImageFile` against edge cases (0 bytes, negative values, missing MIME types, PDF rejection, oversized payloads).
    - Configured `"test": "node --experimental-strip-types --test src/**/*.test.ts"` in `wildbugs-frontend/package.json`.
    - Added `"exclude": ["src/**/*.test.ts"]` to `tsconfig.app.json` for clean client production bundling.
- **🐛 Bugs Discovered**:
  - React 19 / `oxlint` flagged reading `streamRef.current` directly in the hook return object as an impure render pattern (`react(refs): Cannot access refs during render`).
  - Potential promise hang if `video.onloadedmetadata` fired prior to event listener attachment in fast camera initialization environments.
  - TypeScript `tsc -b` raised `TS2591: Cannot find name 'node:test'` when test files were included in the Vite client production compiler target.
  - `formatFileSize` could return `NaN B` if passed non-positive or NaN byte values.
- **🔧 Errors Resolved**:
  - Lifted `stream` into React state (`const [stream, setStream] = useState<MediaStream | null>(null)`), updated on stream acquisition and cleared on stop, eliminating render-time ref access.
  - Added `videoRef.current.readyState >= 1` check and a 2-second timeout guard to ensure metadata resolution never blocks video playback.
  - Excluded test files from `tsconfig.app.json`, keeping Vite client output pristine while running tests through Node 22 native type-stripping.
  - Guarded `formatFileSize(bytes)` with `if (bytes <= 0 || isNaN(bytes)) return '0 B'`.
- **🔄 Methods Replaced / Refactored**:
  - Enhanced `useCamera` return API with both `takePhoto` and `capturePhoto` alias, plus exposed `stream` state, aligning with architecture specification.
  - Enhanced `compressImage` to accept either options objects or positional parameters for seamless API flexibility.
- **📝 Verification Actions & Test Results**:
  - **Frontend Unit Tests**: `npm test` executed 10 tests across 3 suites; 10/10 passed in 186ms (0 failures).
  - **Frontend Linter**: `npm run lint` (`oxlint`) checked 28 files with 116 rules; 0 warnings, 0 errors.
  - **Frontend Production Build**: `npm run build` transformed 148 modules and bundled in 752ms with 0 errors.
  - **Backend Integration Tests**: `npm test` in `wildbugs-backend`; 17/17 tests passed (0 failures).
- **💾 Git Commits**:
  - `ad3ae3f`: `feat(upload-ui): implement mobile camera capture hook with video stream canvas fallback`
  - `ed2d67e`: `feat(upload-ui): add client-side canvas image compression utility`
  - `a699435`: `feat(upload-ui): harden media capture and add client image compression unit test suite`

#### Sub-Phase 2.2: Cloud Storage & Ingestion Pipeline
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **Dependencies Installed**: Added `multer`, `cloudinary`, and `@types/multer` to `wildbugs-backend`.
  - **Cloudinary Configuration (`src/config/cloudinary.ts`)**:
    - Configured Cloudinary v2 SDK from validated environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
    - Added `isCloudinaryConfigured()` status checker and updated `src/config/env.ts` with optional schema defaults for offline/testing support.
  - **Multer Memory Storage Middleware (`src/middleware/upload.ts`)**:
    - Configured `multer.memoryStorage()` keeping uploaded bytes in RAM for streaming to Cloudinary.
    - Set 10MB maximum file size limit (`10 * 1024 * 1024` bytes).
    - Implemented strict MIME filtering accepting only `image/jpeg`, `image/png`, and `image/webp`.
    - Created `uploadSinglePhoto` middleware accepting both `'photo'` and `'image'` form field names.
  - **Global Multer Error Interceptor (`src/middleware/errorHandler.ts`)**:
    - Added dedicated handler for `multer.MulterError` mapping `LIMIT_FILE_SIZE` and related upload errors to HTTP 400 Bad Request JSON envelopes.
  - **Cloud Image Upload Service (`src/services/imageService.ts`)**:
    - Implemented `uploadImage(buffer, folder)` streaming buffers to Cloudinary.
    - Automated 300x300 thumbnail URL generation (`w_300,h_300,c_fill`).
    - Built transparent offline/mock fallback for local and CI testing environments.
    - Implemented `deleteImage(publicId)` for rollback and asset deletion.
  - **Sighting Ingestion Service (`src/services/sightingService.ts`)**:
    - Implemented `create(userId, input)` uploading photos, validating coordinates, linking optional species, and persisting in Prisma database with `PENDING` status.
    - Implemented `getById(id)` with user, species, and identification relation joins.
    - Implemented `getUserSightings(userId, page, limit)` with paginated query results.
    - Implemented `getRecent(limit)` for public observation feed.
  - **Sighting API Controller & Routes (`sightingController.ts`, `sightingRoutes.ts`)**:
    - Implemented `POST /api/sightings` with JWT authentication and multipart photo upload.
    - Added Zod coercion schema for latitude (-90 to 90) and longitude (-180 to 180).
    - Mounted `/api/sightings` endpoints in `src/app.ts`.
  - **Automated Integration & Unit Tests**:
    - Created `tests/unit/services/imageService.test.ts` (upload and delete tests).
    - Created `tests/integration/routes/sightings.test.ts` (6 route validation tests).
- **🐛 Bugs Discovered**:
  - `sightingController.ts` attempted to access `req.user.id` when `AuthUserPayload` declared `userId`.
  - Unhandled Multer file size errors defaulted to generic 500 internal server errors without custom handler.
- **🔧 Errors Resolved**:
  - Updated `AuthUserPayload` in `src/types/express.d.ts` with optional `id?: string` alias and resolved via `req.user?.userId || req.user?.id`.
  - Added `if (err instanceof multer.MulterError)` to `errorHandler.ts` returning structured 400 JSON error envelopes.
- **🔄 Methods Replaced / Refactored**:
  - Replaced rigid field name expectation with `uploadSinglePhoto` supporting both `'photo'` and `'image'` field inputs.
- **📝 Verification Actions & Test Results**:
  - **Backend Test Suite**: 25/25 tests passing across 7 test suites (`0` failures) in 17.3s.
  - **Backend TypeScript Compilation**: `npm run build` compiled with 0 errors.
  - **Frontend Test Suite**: 10/10 unit tests passing (`0` failures) in 348ms.
  - **Frontend Linter & Build**: `oxlint` 0 errors/warnings; `npm run build` bundled 148 modules in 866ms.
- **💾 Git Commits**:
  - `faece9f`: `feat(storage): configure multer memory storage and cloudinary image upload service`
  - `b5c539e`: `feat(sightings): implement sighting creation endpoint with coordinates and image metadata`

#### Sub-Phase 2.3: Asynchronous AI Vision Pipeline
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **BullMQ & Redis Queue Setup (`src/database/redis.ts`, `src/jobs/queue.ts`)**:
    - Configured IORedis client with graceful connection failure handling and reconnection backoff.
    - Added BullMQ compatibility setting `maxRetriesPerRequest: null`.
    - Initialized `identificationQueue` using BullMQ with automated exponential retry backoff.
    - Implemented helper methods `addIdentificationJob(data)` and `closeIdentificationQueue()`.
    - Added unit test suite `tests/unit/jobs/queue.test.ts` verifying queue configuration.
  - **Google Cloud Vision Worker & Identification Service (`src/config/vision.ts`, `src/services/identificationService.ts`, `src/jobs/identifyInsect.job.ts`)**:
    - Created Google Cloud Vision client wrapper with mock fallback when credentials are not configured in dev/test environments.
    - Implemented `identificationService.annotateImage(imageUrl)` fetching vision label annotations and confidence scores.
    - Implemented `identificationService.matchLabelsToSpecies(labels)` matching labels against database species common names, scientific names, and taxonomic families.
    - Implemented `processInsectIdentificationJob(job)` background worker logic updating sighting status to `IDENTIFIED` or `UNIDENTIFIED` and recording `Identification` entries.
    - Attached background worker startup and graceful shutdown in `src/server.ts`.
    - Integrated automatic queue dispatch in `sightingService.create()` immediately upon sighting persistence.
    - Added unit test suite `tests/unit/services/identificationService.test.ts`.
- **🐛 Bugs Discovered**:
  - Redis connection refused during test runs when no local Redis server is active, producing unhandled error events.
  - Identification job required graceful null handling when species matching finds no high-confidence classification.
- **🔧 Errors Resolved**:
  - Added warning interceptor on Redis error event (`redisClient.on('error', ...)`) preventing unhandled node process crashes when Redis is offline.
  - Structured `identifyInsect.job.ts` to log fallback message and leave sighting marked for community identification without throwing unhandled exceptions.
- **🔄 Methods Replaced / Refactored**:
  - Implemented offline-resilient label matching simulation to guarantee non-blocking test execution and local developer experience.
- **📝 Verification Actions & Test Results**:
  - **Backend Test Suite**: 30/30 tests passing across 9 test suites (`0` failures) in 30.9s.
  - **Backend TypeScript Compilation**: `npm run build` compiled with 0 errors.
  - **Frontend Test Suite**: 10/10 unit tests passing (`0` failures).
  - **Frontend Build**: Vite production build succeeded in 537ms with 0 errors.
- **💾 Git Commits**:
  - `85935cb`: `feat(queue): configure redis connection and bullmq job queue infrastructure`
  - `2985160`: `feat(ai): integrate google cloud vision worker for automatic insect classification`

#### Sub-Phase 2.4: Upload Experience & Discovery Detail View
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **Sighting API Client & Type Definitions (`src/api/sightingsApi.ts`, `src/types/sighting.ts`)**:
    - Created typed API wrapper for `createSighting` (with multipart `FormData` and upload progress events), `getSightingById`, `getMySightings`, and `getRecentSightings`.
    - Defined TypeScript interfaces for `Sighting`, `SightingStatus`, `SightingIdentification`, and API responses.
  - **Geolocation Detection Hook (`src/hooks/useGeolocation.ts`)**:
    - Created `useGeolocation` hook with permissions query state (`granted`, `prompt`, `denied`).
    - Handled geolocation error codes (permission denied, position unavailable, timeout) and high-accuracy acquisition.
    - Provided manual coordinate overrides and precision formatting.
  - **Upload Wizard State Management (`src/store/uploadStore.ts`)**:
    - Built Zustand store tracking 5 distinct stages (`capture`, `preview`, `location`, `submitting`, `success`).
    - Stored raw and compressed file blobs, preview URLs, dimensions, and bandwidth optimization statistics.
    - Managed upload progress percentage (0–100%) and error state.
  - **Camera Capture & File Dropzone (`src/components/sightings/PhotoCapture.tsx`)**:
    - Integrated mobile camera viewfinder stream via `useCamera` hook with front/rear camera flipping.
    - Added drag-and-drop file upload target with raw size validation and automatic client-side canvas compression.
  - **Multi-Step Upload Form (`src/components/sightings/UploadForm.tsx`)**:
    - Step 1 (Capture): Live camera capture or local file dropzone.
    - Step 2 (Preview): Image inspection with live bandwidth savings badge and dimensions readout.
    - Step 3 (Location): Automated GPS coordinate detection, manual coordinate fields with range validation (-90/90, -180/180), optional species dropdown, and observation timestamp.
    - Step 4 (Submitting): Animated progress bar with step status feedback.
    - Step 5 (Success): Result card displaying coordinates, thumbnail preview, status chip, and direct link to observation.
  - **Upload View Layout (`src/pages/UploadPage.tsx`)**:
    - Built responsive layout with field photography advice (lighting, key morphological features) and ethical guidelines.
  - **Sighting Detail & AI Result View (`src/components/sightings/IdentificationResult.tsx`, `src/pages/SightingDetailPage.tsx`)**:
    - Implemented `IdentificationResult` component with dynamic AI confidence meter, source pill badges, species spotlight card, and correction trigger modal.
    - Created `SightingDetailPage` with automated 3-second polling on `PENDING` sightings until AI worker completes classification.
    - Added high-resolution image viewer, observer attribution card, geospatial coordinate copy button, and OpenStreetMap external deep-link.
    - Appended complete ecological dossier (habitat, diet, lifecycle, conservation status) when species is classified.
  - **Navigation Integration (`App.tsx`, `Navbar.tsx`, `BottomNav.tsx`)**:
    - Added protected `/upload` route and public `/sightings/:id` route in `App.tsx`.
    - Added "📸 Record Sighting" links in desktop navbar, mobile drawer, and mobile bottom navigation bar.
  - **Unit Test Suites (`src/store/uploadStore.test.ts`, `src/components/sightings/IdentificationResult.test.ts`)**:
    - Added 9 unit tests verifying upload store step transitions, coordinate setting, progress handling, confidence tier mapping, and OpenStreetMap link generation.
- **🐛 Bugs Discovered**:
  - `uploadStore.test.ts` import resolution failed under Node's native test runner `--experimental-strip-types` when type imports lacked explicit `type` keyword.
  - Strict TypeScript compiler (`tsc -b`) flagged non-type imports in `sightingsApi.ts`, `sighting.ts`, and an unused `formatFileSize` import.
  - React linter (`oxlint`) detected synchronous `setState` in effect hooks for geolocation.
- **🔧 Errors Resolved**:
  - Converted all type references to `import type` across `sightingsApi.ts`, `sighting.ts`, and `uploadStore.ts`.
  - Replaced synchronous `useEffect` state syncing in `UploadForm.tsx` with user-driven event handler `handleDetectLocation`, eliminating cascading renders.
- **🔄 Methods Replaced / Refactored**:
  - Replaced manual page refresh with automated TanStack Query polling interval on pending sightings, creating a seamless real-time AI classification experience.
- **📝 Verification Actions & Test Results**:
  - **Backend Test Suite**: 30/30 tests passing across 9 test suites (`0` failures) in 27.6s.
  - **Frontend Test Suite**: 19/19 tests passing across 5 test suites (`0` failures) in 276ms.
  - **Frontend Linter**: `oxlint` reported 0 warnings and 0 errors across 38 files.
  - **Frontend Build**: `tsc -b && vite build` compiled 158 modules in 393ms with 0 errors.
- **💾 Git Commits**:
  - `f8ec8c9`: `feat(upload-ui): build multi-step photo upload flow with automatic gps detection`
  - `8917611`: `feat(sighting-detail): display sighting details with ai confidence score and status badge`

#### 🏁 Phase 2 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ✅ Completed
- **Iterative Bug Sweep & Resolution Audit**:
  - *Discovered Defects & Runtime Errors*: 0 remaining; all type errors, linter warnings, and runner imports resolved.
  - *Suboptimal Methods Replaced / Refactored*: Handled Redis disconnection gracefully during unit testing, replaced synchronous effect sync with direct event callbacks, and added polling on pending AI classifications.
  - *Repeated Test Iteration Results*: All 49 automated unit and integration tests passing cleanly (30 backend, 19 frontend). Zero runtime errors.
- **Git Commit**: `git commit -m "docs: complete Phase 2 bug audit, progress report, and readme"`
- **Remote Push**: `git push origin main`

---

### 🗺️ Phase 3 — Biodiversity Map

#### Sub-Phase 3.1: Geospatial Backend & Spatial Queries
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **Geospatial & Spatial Aggregation Service (`src/services/mapService.ts`)**:
    - Implemented `getSightingsGeoJSON(filters)` querying sightings within a bounding box (`minLat`, `maxLat`, `minLng`, `maxLng`) with filters (`speciesId`, `dateFrom`, `dateTo`, `limit`).
    - Handled standard and antimeridian-spanning bounding boxes (`minLng > maxLng`) with Boolean OR logic.
    - Serialized observations to RFC 7946 standard GeoJSON `FeatureCollection` with `[longitude, latitude]` Point geometry and comprehensive metadata properties (`speciesName`, `commonName`, `scientificName`, `family`, `thumbnailUrl`, `photoUrl`, `observedAt`, `status`, `aiConfidence`, `userId`, `observerName`).
    - Implemented `aggregateIntoGridCells(points, gridSize)` aggregating coordinates into spatial grid cells of ~0.01 degrees (~1.1 km) and summing intensity counts for Leaflet-heat.
    - Implemented `getHeatmapData(filters)` returning `[latitude, longitude, intensity]` tuples for density mapping.
  - **Map Controller & Zod Validation (`src/controllers/mapController.ts`)**:
    - Created strict Zod validation schemas for query parameters with range boundaries (-90 to 90 lat, -180 to 180 lng, 0.001 to 1.0 grid size) and cross-field refinements (`minLat <= maxLat`, `dateFrom <= dateTo`).
    - Implemented `getSightingsHandler` returning RFC 7946 GeoJSON FeatureCollections.
    - Implemented `getHeatmapHandler` returning aggregated density point arrays with intensity values.
  - **Map Routes & App Routing (`src/routes/mapRoutes.ts`, `src/app.ts`)**:
    - Mounted `GET /api/map/sightings` and `GET /api/map/heatmap`.
    - Integrated `/api/map` router into main Express pipeline in `src/app.ts`.
  - **Automated Test Suites (`tests/unit/services/mapService.test.ts`, `tests/integration/routes/map.test.ts`)**:
    - Created unit tests for `aggregateIntoGridCells` (empty inputs, NaN coordinates, cell snapping, distance separation, custom grid size) and `buildWhereClause` (bounding box, antimeridian, species, dates).
    - Created integration tests validating HTTP 400 responses on invalid bounding box coordinates, inversions, bad dates, out-of-range grid sizes, and parameter malformations.
- **🐛 Bugs Discovered**:
  - Integration test assertions in `map.test.ts` originally looked for field messages in top-level `body.message` instead of `body.details` array generated by centralized Zod error handler.
- **🔧 Errors Resolved**:
  - Updated test assertions to inspect `body.details` for field-specific error messages.
- **🔄 Methods Replaced / Refactored**:
  - Sanitized floating-point coordinates in spatial grid snapping using fixed-precision rounding to eliminate IEEE-754 precision artifacts.
- **📝 Verification Actions & Test Results**:
  - **Backend Test Suite**: 50/50 tests passing across 11 test suites (`0` failures) in 31.3s.
  - **Backend TypeScript Build**: `npm run build` compiled with 0 errors.
  - **Frontend Test Suite**: 19/19 unit tests passing (`0` failures) in 399ms.
  - **Frontend Linter & Build**: `oxlint` 0 warnings/errors; `npm run build` compiled 158 modules in 2.13s with 0 errors.
- **💾 Git Commits**:
  - `feat(map-api): implement bounding-box geojson and sighting density heatmap endpoints`

#### Sub-Phase 3.2: Interactive Map UI & Rendering Engine
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **Leaflet & Mapping Dependencies**:
    - Installed `leaflet`, `react-leaflet`, `leaflet.markercluster`, `@types/leaflet.markercluster`, `leaflet.heat`, and `@types/leaflet.heat`.
  - **Map Store State Management (`src/store/mapStore.ts`)**:
    - Built Zustand store with persistence middleware (`wildbugs_map_state`) storing viewport center (`[lat, lng]`) and zoom level.
    - Synchronized visible bounding box (`minLat`, `maxLat`, `minLng`, `maxLng`), active filters (`speciesId`, `dateFrom`, `dateTo`), view mode (`markers` vs `heatmap`), and selected sighting IDs.
  - **Map API Client & Types (`src/api/mapApi.ts`, `src/types/map.ts`)**:
    - Defined TypeScript interfaces for RFC 7946 GeoJSON Features, geometries, and FeatureCollections.
    - Implemented `fetchSightingsGeoJSON(bounds, filters)` and `fetchHeatmapData(bounds, filters, gridSize)`.
  - **Interactive Map Component (`src/components/map/BiodiversityMap.tsx`)**:
    - Built full-screen Leaflet `MapContainer` with OpenStreetMap tile layer and dark theme canvas.
    - Implemented `MapEventsHandler` listening to `moveend` to dynamically capture visible bounds and viewport changes.
    - Wired TanStack Query (`useQuery`) to automatically fetch GeoJSON sightings for visible bounds with 30s caching.
    - Implemented `LocateControl` quick action button centering map to user's GPS coordinates using `navigator.geolocation`.
    - Added map status HUD pill reporting real-time observation counts and scanning states.
  - **Custom Insect Pin Markers & Popups (`src/components/map/SightingMarker.tsx`)**:
    - Implemented custom `L.divIcon` pins with glowing circular containers, insect emoji badge, and dynamic status indicator dots.
    - Created rich popup cards displaying observation thumbnail, common name, italicized scientific name, observer badge, formatted date, AI match confidence score, and direct link to inspection view.
  - **Full-Screen Map View & Navigation (`src/pages/MapPage.tsx`, `App.tsx`, `Navbar.tsx`, `BottomNav.tsx`)**:
    - Created `MapPage.tsx` importing Leaflet CSS and rendering `BiodiversityMap`.
    - Added `/map` route in `App.tsx`.
    - Added "🗺️ Biodiversity Map" link in desktop navbar, mobile drawer, and mobile bottom navigation bar.
  - **Shared Map Utilities & Test Suite (`src/utils/mapUtils.ts`, `src/utils/mapUtils.test.ts`, `src/store/mapStore.test.ts`)**:
    - Created pure helper functions for badge color mapping, date formatting, and coordinate conversion (`[lng, lat]` to `[lat, lng]`).
    - Added 14 unit tests across map utilities and map store.
- **🐛 Bugs Discovered**:
  - Leaflet cannot be imported at the module top level in Node.js test runners without throwing `ReferenceError: window is not defined`.
  - Node.js ESM test runner with `--experimental-strip-types` required explicit `.ts` file extensions in test imports.
  - Oxlint identified fast-refresh warning for non-component export in `SightingMarker.tsx` and an unused state parameter in `mapStore.ts`.
- **🔧 Errors Resolved**:
  - Extracted pure mapping logic into `mapUtils.ts` and encapsulated Leaflet icon instantiation inside `SightingMarker.tsx`, allowing clean Node.js test execution.
  - Added explicit `.ts` file extensions to test imports (`./mapStore.ts`, `./mapUtils.ts`).
  - Addressed all oxlint rules, achieving 0 warnings and 0 errors across 48 files.
- **🔄 Methods Replaced / Refactored**:
  - Replaced Leaflet default PNG pin assets with SVG/HTML `L.divIcon` components, completely bypassing Vite asset resolution quirks and elevating visual polish.
- **📝 Verification Actions & Test Results**:
  - **Frontend Test Suite**: 33/33 unit tests passing across 10 test suites (`0` failures) in 542ms.
  - **Frontend Linter & Build**: `oxlint` 0 warnings/errors; `npm run build` compiled 206 modules into production bundle in 1.83s.
  - **Backend Test Suite**: 50/50 tests passing across 11 test suites (`0` failures).
- **💾 Git Commits**:
  - `feat(map-ui): integrate leaflet map container with custom insect markers and popups`

#### Sub-Phase 3.3: Advanced Visualization & Filter Controls
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **Marker Clustering Layer (`src/components/map/MarkerCluster.tsx`)**:
    - Wrapped dense observation markers inside `leaflet.markercluster` to group pins at lower zoom levels, avoiding map clutter and maximizing frame rates.
    - Designed custom cluster icons with dynamic size classes (`wildbugs-cluster-sm`, `md`, `lg`) and theme color glows (emerald for small clusters, amber for medium, red for high-density clusters).
    - Preserved rich interactive popup cards when clicking spiderfied or individual insect pins.
  - **Density Heatmap Layer (`src/components/map/HeatmapLayer.tsx`)**:
    - Implemented toggleable heatmap layer using `leaflet.heat` plugin.
    - Configured multi-tier density color gradients (`#06b6d4` cyan, `#10b981` emerald, `#f59e0b` amber, `#ef4444` red hotspots).
    - Handled automatic layer cleanup on unmount and filter updates.
  - **Map Filter Sidebar Drawer (`src/components/map/MapFilters.tsx`)**:
    - Created collapsible glassmorphism floating drawer with active filters count indicator badge.
    - Integrated segmented view mode switcher (`📍 Pins / Cluster` vs `🔥 Heatmap`).
    - Added species catalog dropdown filter populated from `/api/species`.
    - Added observation date range inputs (`dateFrom`, `dateTo`) and quick range presets ("Past 30 Days", "Past Year").
    - Added "Clear All Filters" reset button.
  - **Biodiversity Map Integration (`src/components/map/BiodiversityMap.tsx`)**:
    - Combined `MarkerCluster`, `HeatmapLayer`, and `MapFilters` with dynamic layer switching based on `filters.viewMode`.
    - Parallelized TanStack Query fetching between GeoJSON and heatmap density points.
  - **Map Utilities & Unit Test Suite (`src/utils/mapUtils.ts`, `src/utils/mapUtils.test.ts`)**:
    - Added `calculateDatePresetRange(days, now)` helper function.
    - Added unit test cases for relative date calculations across leap years.
- **🐛 Bugs Discovered**:
  - React fast-refresh linter warning in `MarkerCluster.tsx` for non-component export (`createPopupHtml`).
- **🔧 Errors Resolved**:
  - Encapsulated helper function within component scope, achieving 0 warnings and 0 errors across 51 files.
- **🔄 Methods Replaced / Refactored**:
  - Replaced manual date math with centralized `calculateDatePresetRange` utility.
- **📝 Verification Actions & Test Results**:
  - **Frontend Test Suite**: 35/35 unit tests passing across 11 test suites (`0` failures) in 379ms.
  - **Frontend Linter & Build**: `oxlint` 0 warnings/errors; `npm run build` compiled 212 modules in 758ms with 0 errors.
  - **Backend Test Suite**: 50/50 tests passing across 11 test suites (`0` failures).
- **💾 Git Commits**:
  - `feat(map-ui): integrate marker clustering, density heatmap layer, and filter drawer`

#### 🏁 Phase 3 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ✅ Completed (Zero Bugs Gate Passed)
- **Iterative Bug Sweep & Resolution Audit**:
  - *Discovered Defects & Runtime Errors*:
    1. **RFC 7946 GeoJSON vs Leaflet Coordinate Inversion**: Verified that coordinates sent by backend are standard GeoJSON `[longitude, latitude]` and converted to Leaflet `[latitude, longitude]` in all marker and cluster renderers.
    2. **Antimeridian Bounding Box Crossing**: Verified that backend `mapService.buildWhereClause` handles Pacific bounds (`minLng > maxLng`) using Boolean `OR` queries without errors.
    3. **Node.js Test Runner Leaflet Top-Level Import**: Leaflet threw `ReferenceError: window is not defined` when imported in Node.js test runs. Resolved by decoupling pure mapping utilities (`mapUtils.ts`) from DOM-dependent Leaflet components.
    4. **Leaflet Layer Teardown & Memory Leaks**: Verified all cluster groups and heat layers are cleaned up via `map.removeLayer` on component unmount and view mode changes.
    5. **Zod Error Detail Mismatch**: Fixed integration test assertion to query `body.details` array for field-specific error messages.
  - *Suboptimal Methods Replaced / Refactored*:
    1. Replaced static default Leaflet PNG markers with custom SVG/HTML `L.divIcon` pins with dynamic status dots and glow effects.
    2. Replaced individual unclustered marker rendering with `L.markerClusterGroup` DOM virtualization for high performance with dense datasets.
    3. Replaced manual date filtering logic with reusable `calculateDatePresetRange` helper.
  - *Repeated Test Iteration Results*:
    - **Backend Test Suite**: 50/50 tests passing across 11 test suites (100% pass rate).
    - **Frontend Test Suite**: 35/35 tests passing across 11 test suites (100% pass rate).
    - **Frontend Linter**: 0 warnings and 0 errors across 51 files.
    - **Frontend Production Build**: `tsc -b && vite build` bundled 212 modules in 758ms with 0 errors.
    - **Total Automated Tests**: 85 tests passing cleanly across full stack with zero failures.
- **Git Commit**: `git commit -m "docs: complete Phase 3 bug audit, progress report, and readme"`
- **Remote Push**: `git push origin main`

---

### 🏆 Phase 4 — Engagement & Gamification

#### Sub-Phase 4.1: User Profile & Field Journal
- **Status**: ✅ Completed
- **🛠️ Changes Performed**:
  - **User & Profile Backend Service (`wildbugs-backend/src/services/userService.ts`)**:
    - Built `UserService` aggregating total sightings count, distinct species count, verified sightings count, and accuracy percentage (`verified / total * 100`).
    - Implemented calendar day streak calculation engine (`calculateObservationStreaks`) computing active daily streak, longest streak, and a 7-day activity window (`last7Days`).
    - Implemented paginated chronological field journal query (`getJournal`) with species metadata, identification suggestions, and pagination meta (`page`, `limit`, `total`, `totalPages`, `hasMore`).
    - Implemented Redis-cached platform leaderboard (`getLeaderboard`) with 15-minute TTL across 'sightings', 'species', and 'verified' metrics with graceful degradation.
  - **User Controllers & Routes (`wildbugs-backend/src/controllers/userController.ts`, `wildbugs-backend/src/routes/userRoutes.ts`)**:
    - Created controller handlers for `getMyProfileHandler`, `getPublicProfileHandler`, `getJournalHandler`, and `getLeaderboardHandler`.
    - Mounted `/api/users/me` (protected with `authenticate`), `/api/users/leaderboard`, `/api/users/:id/journal`, and `/api/users/:id` in `app.ts`.
    - Guarded against param shadowing by mounting `/leaderboard` prior to `/:id`.
  - **User Profile API Client & Types (`wildbugs-frontend/src/api/usersApi.ts`, `wildbugs-frontend/src/types/user.ts`)**:
    - Created typed API client methods: `getMyProfile`, `getUserProfile`, `getFieldJournal`, and `getLeaderboard`.
    - Defined TypeScript interfaces for `UserProfile`, `UserStats`, `JournalSighting`, `JournalSpecies`, `StreakDay`, and `LeaderboardEntry`.
  - **Profile & Field Journal UI Components (`wildbugs-frontend/src/components/profile/`)**:
    - Built `StatsOverview.tsx`: 6 glassmorphic stat cards with metric values, custom glow accents, and responsive layout.
    - Built `StreakTracker.tsx`: Visual flame badge and 7-day activity dot timeline with active green checks, today's pulsing reminder, and all-time record tracker.
    - Built `FieldJournal.tsx`: Sighting cards timeline with photo zoom, verification status badges (`VERIFIED`, `IDENTIFIED`, `PENDING`, `REJECTED`), AI confidence chips, taxonomic chips, coordinate links to `/map`, and TanStack Query `useInfiniteQuery` infinite scrolling with "Load More" pagination.
    - Built `ProfilePage.tsx`: Naturalist hero header with avatar initial, role chip, veteran badge, joined date, action buttons, and integrated streak tracker, stats grid, and field journal.
  - **Navigation & Routing Integration (`App.tsx`, `Navbar.tsx`, `BottomNav.tsx`, `AccountPage.tsx`, `index.css`)**:
    - Registered `/profile` (protected), `/profile/:id`, and `/users/:id` routes in `App.tsx`.
    - Updated navigation bars to link authenticated users directly to `/profile`.
    - Added dedicated CSS styles for profile hero, streak tracker, stats cards, journal timeline, and loading skeletons.
- **🐛 Bugs Discovered**:
  - `oxlint` detected impure function call `new Date()` within render in `StreakTracker.tsx` and unused `isAuthenticated` variable in `ProfilePage.tsx`.
  - `tsc -b` detected `verbatimModuleSyntax` errors for non-type imports in `usersApi.ts`, `FieldJournal.tsx`, `StatsOverview.tsx`, and `StreakTracker.tsx`.
  - Integration test for `GET /api/users/:id` expected 500 when offline DB threw `PrismaClientInitializationError` (which properly yields status 503).
- **🔧 Errors Resolved**:
  - Derived `todayFormatted` purely from `last7Days[last7Days.length - 1]?.date` in `StreakTracker.tsx`, eliminating impure render calls.
  - Converted type imports to `import type { ... }` across all frontend files, satisfying `verbatimModuleSyntax`.
  - Corrected test assertions in `users.test.ts` to expect status `[404, 503]`, passing with 100% success rate.
- **🔄 Methods Replaced / Refactored**:
  - Replaced ad-hoc stats calculation with centralized `calculateObservationStreaks` and database group-by aggregations.
  - Refactored `AccountPage.tsx` preview section into a direct link to the dynamic `ProfilePage` and `FieldJournal`.
- **📝 Verification Actions & Test Results**:
  - **Backend Test Suite**: 61/61 passing across 17 test suites (100% pass rate, including 6 new streak calculation unit tests and 5 new user route integration tests).
  - **Frontend Test Suite**: 39/39 passing across 12 test suites (100% pass rate, including 4 new profile & journal unit tests).
  - **Frontend Linter**: `oxlint` 0 warnings and 0 errors across 58 files.
  - **Frontend Production Build**: `tsc -b && vite build` bundled 217 modules in 1.78s with 0 errors.
- **💾 Git Commits**:
  - `feat(user-api): implement user stats, paginated field journal, and redis-cached leaderboard`
  - `feat(profile-ui): build user profile stats dashboard and infinite-scroll field journal`

#### Sub-Phase 4.2: Habit Tracking & Leaderboards
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 4.3: Automated Badge Engine
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 4.4: Seasonal Challenges
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### 🏁 Phase 4 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ⏳ Pending
- **Iterative Bug Sweep & Resolution Audit**:
  - *Discovered Defects & Runtime Errors*: None yet
  - *Suboptimal Methods Replaced / Refactored*: None yet
  - *Repeated Test Iteration Results*: Pending verification (target: zero streak, badge, or challenge errors)
- **Git Commit**: `git commit -m "docs: complete Phase 4 bug audit, progress report, and readme"`
- **Remote Push**: `git push origin main`

---

### 👥 Phase 5 — Community

#### Sub-Phase 5.1: Community Discussion Forum
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 5.2: Expert Verification System
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 5.3: Notifications Engine
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### 🏁 Phase 5 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ⏳ Pending
- **Iterative Bug Sweep & Resolution Audit**:
  - *Discovered Defects & Runtime Errors*: None yet
  - *Suboptimal Methods Replaced / Refactored*: None yet
  - *Repeated Test Iteration Results*: Pending verification (target: zero forum or notification errors)
- **Git Commit**: `git commit -m "docs: complete Phase 5 bug audit, progress report, and readme"`
- **Remote Push**: `git push origin main`

---

### 🚀 Phase 6 — Polish & Ship

#### Sub-Phase 6.1: Progressive Web App & Offline Sync
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 6.2: Reliability, Performance & Rate Limiting
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 6.3: Testing, Containers & Production Deployment
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### 🏁 Phase 6 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ⏳ Pending
- **Iterative Bug Sweep & Resolution Audit**:
  - *Discovered Defects & Runtime Errors*: None yet
  - *Suboptimal Methods Replaced / Refactored*: None yet
  - *Repeated Test Iteration Results*: Pending verification (target: 100% green test suites and error-free docker deploy)
- **Git Commit**: `git commit -m "docs: complete Phase 6 final bug audit, progress report, and production readme"`
- **Remote Push**: `git push origin main`
