# Contributing to WildBugs 2.0

Thank you for your interest in contributing to **WildBugs 2.0**! We welcome community contributions, bug fixes, taxonomic improvements, geospatial features, and UI enhancements.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: v18.0 or higher (v20+ LTS recommended)
- **PostgreSQL**: v15 or higher with the **PostGIS** spatial extension
- **Redis**: v7 or higher
- **Docker & Docker Compose** (recommended for full-stack spinup)

### 2. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/WildBugs2.0.git
cd WildBugs2.0
```

### 3. Backend Setup (`wildbugs-backend/`)
```bash
cd wildbugs-backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL PostGIS connection string and JWT_SECRET

# Run database migrations and seed 30 species
npx prisma generate
npx prisma db push
npm run prisma:seed

# Start the development API server
npm run dev
# API running at http://localhost:3001
```

### 4. Frontend Setup (`wildbugs-frontend/`)
```bash
cd ../wildbugs-frontend
npm install
npm run dev
# UI running at http://localhost:5173
```

---

## 🧪 Testing & Quality Assurance

Before opening any Pull Request, ensure that all automated test suites pass with zero regressions:

```bash
# Run backend test suite (116 tests)
cd wildbugs-backend && npm test

# Run frontend test suite (70 tests)
cd ../wildbugs-frontend && npm test
```

### Pull Request Checklist:
- [ ] All 186 unit and integration tests pass.
- [ ] New endpoints or business logic include accompanying test coverage.
- [ ] No hardcoded secrets, database URLs, or API keys in code.
- [ ] Code adheres to TypeScript strict typing and project ESLint rules.

---

## 🌿 Git Branching & Commits

- Create feature branches from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Use conventional commit messages:
  - `feat(map): add cluster boundary radius filter`
  - `fix(vision): handle low-confidence species fallbacks`
  - `docs: update API contracts for bioblitz challenges`
  - `test: add unit coverage for offline queue sync`

---

## 📄 License
By contributing to WildBugs 2.0, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
