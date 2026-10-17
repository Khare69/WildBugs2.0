# 📋 WildBugs 2.0 — Progress Report & Implementation Audit Log

> **Remote Repository**: [`https://github.com/Khare69/WildBugs2.0.git`](https://github.com/Khare69/WildBugs2.0.git)  
> **Protocol**: This document is updated after **every sub-phase completion** and audited after **every phase completion**.
> **Zero-Bug Quality Gate**: At the end of every phase, a comprehensive bug sweep is conducted. All errors are diagnosed and resolved; any fragile or suboptimal approaches are replaced or refactored; and components are **tested repeatedly until zero bugs remain** before documentation is committed and pushed to the remote repository.

---

## 📊 Phase Execution Overview

| Phase | Description | Sub-Phases | Status | Bug Audit Gate | Remote Synced | Last Updated |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **Phase 1** | Foundation (Scaffolding, DB, Auth, Species, Shell) | 1.1 – 1.5 | ✅ Completed | ✅ Passed (0 Bugs) | Yes | 2026-10-16 |
| **Phase 2** | Core Upload Loop (Capture, Storage, AI Vision, Detail) | 2.1 – 2.4 | ⏳ Pending | ⏳ Pending | No | — |
| **Phase 3** | Biodiversity Map (PostGIS, Leaflet, Clustering, Heatmap) | 3.1 – 3.3 | ⏳ Pending | ⏳ Pending | No | — |
| **Phase 4** | Engagement & Gamification (Journal, Streaks, Badges, Challenges) | 4.1 – 4.4 | ⏳ Pending | ⏳ Pending | No | — |
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
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 2.4: Upload Experience & Discovery Detail View
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### 🏁 Phase 2 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ⏳ Pending
- **Iterative Bug Sweep & Resolution Audit**:
  - *Discovered Defects & Runtime Errors*: None yet
  - *Suboptimal Methods Replaced / Refactored*: None yet
  - *Repeated Test Iteration Results*: Pending verification (target: zero upload or queue processing errors)
- **Git Commit**: `git commit -m "docs: complete Phase 2 bug audit, progress report, and readme"`
- **Remote Push**: `git push origin main`

---

### 🗺️ Phase 3 — Biodiversity Map

#### Sub-Phase 3.1: Geospatial Backend & Spatial Queries
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 3.2: Interactive Map UI & Rendering Engine
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### Sub-Phase 3.3: Advanced Visualization & Filter Controls
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

#### 🏁 Phase 3 Quality Gate & Wrap-Up Audit
- **Phase Completion Status**: ⏳ Pending
- **Iterative Bug Sweep & Resolution Audit**:
  - *Discovered Defects & Runtime Errors*: None yet
  - *Suboptimal Methods Replaced / Refactored*: None yet
  - *Repeated Test Iteration Results*: Pending verification (target: zero map rendering or query errors)
- **Git Commit**: `git commit -m "docs: complete Phase 3 bug audit, progress report, and readme"`
- **Remote Push**: `git push origin main`

---

### 🏆 Phase 4 — Engagement & Gamification

#### Sub-Phase 4.1: User Profile & Field Journal
- **Status**: ⏳ Pending
- **🛠️ Changes Performed**:
- **🐛 Bugs Discovered**:
- **🔧 Errors Resolved**:
- **🔄 Methods Replaced / Refactored**:
- **📝 Verification Actions & Test Results**:

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
