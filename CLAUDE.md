# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- TAG:INDEX
COMMANDS | ARCHITECTURE | FRONTEND | BACKEND | DATA_FLOW | AUTH | PITFALLS | TIMEZONE | LOCALES | ENV_VARS | DEPLOYMENT
-->

---

<!-- TAG:COMMANDS -->
## Commands

```bash
# Backend (port 5000)
cd backend && npm run dev          # nodemon auto-reload
cd backend && npm start            # plain node (production)

# Frontend (port 3000)
cd frontend && npm run serve       # Vue CLI dev server
cd frontend && npm run build       # production build

# First-time setup
cd backend && npm install && cd ../frontend && npm install
# Then POST /api/auth/setup  →  creates default admin (admin / admin)
```

> No test framework is configured in this project.

---

<!-- TAG:ARCHITECTURE TAG:FRONTEND -->
## Architecture — Frontend (Vue 3, Options API)

| File | Role |
|------|------|
| `frontend/src/views/Admin.vue` | ~12k-line **monolithic** admin dashboard — calendar, day view, appointments, services, barbers, customers, timeslots, restrictions. **Do not split without explicit instruction.** |
| `frontend/src/views/Home.vue` | Customer-facing public booking page |
| `frontend/src/components/LoginModal.vue` | Login UI — posts to `/api/auth/login`, stores JWT |
| `frontend/src/utils/auth.js` | Axios interceptors: attaches `Authorization: Bearer <token>` on every request; 401 → auto-logout. Token key: `adminToken` in localStorage |
| `frontend/src/locales/{en,de}.js` | All UI strings. Default locale: **German (`de`)**. See TAG:LOCALES pitfall. |
| `frontend/src/i18n.js` | vue-i18n setup; locale preference persisted in localStorage |
| `frontend/src/router/index.js` | 3 routes: `/` (Home), `/appointments`, `/admin` (requiresAuth guard) |
| `frontend/src/utils/timezoneHelper.js` | Client-side timezone helpers (mirrors backend) |
| `frontend/src/composables/useTheme.js` | Light/dark theme toggle |

---

<!-- TAG:ARCHITECTURE TAG:BACKEND -->
## Architecture — Backend (Express.js)

| File | Role |
|------|------|
| `backend/server.js` | Entry point — mounts all `/api/*` routes, starts email scheduler + cleanup cron |
| `backend/routes/auth.js` | JWT login, `verifyToken()` middleware, profile updates |
| `backend/routes/appointments.js` | Full CRUD; public POST, protected GET/PUT/DELETE |
| `backend/routes/barbers.js` | Barber management |
| `backend/routes/services.js` | Service CRUD (name, duration, price) |
| `backend/routes/timeslots.js` | Working-hours config per barber/day |
| `backend/routes/restrictions.js` | Blackout dates per barber |
| `backend/routes/customers.js` | Customer profile management |
| `backend/services/emailService.js` | Resend API — appointment confirmation emails |
| `backend/services/emailScheduler.js` | node-cron — drains `EmailQueue` collection |
| `backend/services/cleanupService.js` | Periodic purge of old/cancelled appointments |
| `backend/utils/timezoneHelper.js` | **All date ops go through here.** See TAG:TIMEZONE. |
| `backend/utils/safeConsole.js` | Sanitized console output |

**CORS allowed origins:** `https://ates-barberos.com`, `https://www.ates-barberos.com`, `http://localhost:3000`, `http://localhost:8080`

---

<!-- TAG:DATA_FLOW TAG:AUTH -->
## Data Flow & Auth

**Customer booking (public)**
```
Home.vue  →  POST /api/appointments  →  Appointment model saved  →  EmailQueue entry created
```

**Admin session**
```
LoginModal.vue  →  POST /api/auth/login  →  JWT (24h TTL)  →  localStorage.adminToken
All admin Axios calls  →  auth.js interceptor adds Bearer token  →  verifyToken() middleware
401 response  →  interceptor clears token + redirects to /
```

**Setup (first run only)**
```
POST /api/auth/setup  →  creates Admin doc  (username: admin, password: admin)
```

---

<!-- TAG:PITFALLS TAG:TIMEZONE -->
## Critical Pitfall — Timezone

**Never** use `toISOString().split('T')[0]` — UTC offset shifts the day for German users.

**Correct frontend date string:**
```js
const d = new Date();
const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
```

**Backend:** always pass dates through `normalizeDateToGerman()` from `backend/utils/timezoneHelper.js`.

Key helper functions:
- `getGermanNow()` — current moment in Europe/Berlin
- `getGermanToday()` — today at midnight UTC (German context)
- `normalizeDateToGerman(dateInput)` — normalize any input to midnight UTC
- `getGermanDateString(date)` — returns `YYYY-MM-DD`

---

<!-- TAG:PITFALLS TAG:LOCALES -->
## Critical Pitfall — Locale Files

`en.js` and `de.js` each export **one flat JS object**. A duplicate top-level key silently discards the earlier block — you lose all keys from the first occurrence with no error.

- Always `Grep` for an existing key before adding a new top-level section.
- Both files must stay in sync; add keys to both at the same time.

---

<!-- TAG:PITFALLS -->
## Critical Pitfall — Vue Reactive Objects in API Calls

Do **not** spread reactive objects into Axios payloads:
```js
// WRONG
axios.put(`/api/services/${id}`, { ...this.editingService });

// CORRECT — pluck only required fields
axios.put(`/api/services/${id}`, {
  name: this.editingService.name,
  duration: this.editingService.duration,
  price: this.editingService.price,
});
```

---

<!-- TAG:ENV_VARS -->
## Environment Variables

| Variable | File | Purpose |
|----------|------|---------|
| `VUE_APP_API_URL` | `frontend/.env` | Backend API base URL |
| `PORT` | `backend/.env` | Express port (default 5000) |
| `MONGODB_URI` | `backend/.env` | MongoDB Atlas connection string |
| `JWT_SECRET` | `backend/.env` | JWT signing secret |
| `RESEND_API_KEY` | `backend/.env` | Resend email API key |
| `FROM_EMAIL` | `backend/.env` | Sender address for emails |
| `FROM_NAME` | `backend/.env` | Sender display name |
| `CORS_ORIGIN` | `backend/.env` | Allowed origin for CORS |
| `APP_URL` | `backend/.env` | Public app URL (used in email links) |

---

<!-- TAG:DEPLOYMENT -->
## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full guide.

Stack: **GitHub Actions → VPS, Nginx reverse proxy, PM2 process manager**

Batch helper scripts (Windows, local dev only):
- `start-backend.bat` — `cd backend && npm run dev`
- `start-frontend.bat` — `cd frontend && npm run serve`
- `setup-admin.bat` — creates default admin user
