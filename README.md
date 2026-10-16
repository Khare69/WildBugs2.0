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
| **Phase 1** | **Foundation** | ⏳ In Progress | Scaffolding, Prisma schema, species seed, JWT auth, species catalog UI |
| **Phase 2** | **Core Upload Loop** | ⏳ Upcoming | Media capture, Cloudinary pipeline, async Cloud Vision AI worker, discovery view |
| **Phase 3** | **Biodiversity Map** | ⏳ Upcoming | PostGIS spatial queries, interactive Leaflet map, clustering, density heatmap |
| **Phase 4** | **Engagement & Gamification** | ⏳ Upcoming | User profiles, field journal, streak engine, automated badges, seasonal challenges |
| **Phase 5** | **Community & Moderation** | ⏳ Upcoming | Forum threads, expert verification system, notification bell with polling |
| **Phase 6** | **Polish, Hardening & Deployment** | ⏳ Upcoming | PWA offline sync, Redis caching, rate limiting, Docker containerization, health probes |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- PostgreSQL (with PostGIS extension enabled)
- Redis server
- Cloudinary Account & Google Cloud Vision API credentials

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/Khare69/WildBugs2.0.git
cd WildBugs2.0

# Install dependencies (once scaffolding is generated)
npm install
```

### Environment Variables (.env)
A template `.env.example` will be maintained as each module is developed. See [`architecture_plan.md`](./architecture_plan.md) for full configuration specs.

---

## 📜 Development & Git Protocol

1. **Sub-Task Atomic Commits**: Every sub-task is followed immediately by an atomic git commit:
   ```bash
   git add .
   git commit -m "<type>(<scope>): <summary>"
   ```
2. **Sub-Phase & Phase Progress Tracking**: Detailed logs of changes performed, bugs discovered, errors resolved, and methods refactored are recorded in [`PROGRESS_REPORT.md`](./PROGRESS_REPORT.md).
3. **Phase Wrap-Up & Remote Push**:
   ```bash
   git add PROGRESS_REPORT.md README.md
   git commit -m "docs: record Phase X progress report and update readme"
   git push origin main
   ```
