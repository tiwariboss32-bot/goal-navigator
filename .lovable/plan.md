
## Backend Scaffold Creation Plan

### Goal
Create a Node.js backend scaffold at `/backend` to prepare for future Supabase-to-Node.js migration without modifying existing frontend or Supabase architecture.

### Current State
- Frontend: Vite React + TypeScript
- Backend: Supabase + Edge Functions (check-subscription, create-checkout, customer-portal, goal-chat, send-reminders, verify-payment)
- No backend folder exists

### What Will Be Created

**1. Folder Structure** (`/backend/`)
```
backend/
├── src/
│   ├── server.js
│   ├── routes/
│   │   └── health.js
│   ├── controllers/
│   ├── services/
│   ├── db/
│   │   └── client.js
│   └── config/
│       └── env.js
├── migrations/
│   └── 001_initial.sql
├── docker-compose.yaml
├── package.json
└── README.md
```

**2. Files to Create**

- **`backend/package.json`**: Minimal Node project with Express, pg, dotenv dependencies
- **`backend/docker-compose.yaml`**: PostgreSQL 15 container (port 5432, volume for persistence)
- **`backend/src/server.js`**: Express app with `/health` endpoint
- **`backend/src/db/client.js`**: PostgreSQL Pool client wrapper
- **`backend/src/config/env.js`**: Environment variable loader
- **`backend/src/routes/health.js`**: Health check route handler
- **`backend/migrations/001_initial.sql`**: Empty migration placeholder
- **`backend/README.md`**: Documentation explaining the scaffold

**3. Key Details**
- All files are new; no existing code is modified
- Node type set to "module" (ES6 imports)
- PostgreSQL runs locally via Docker
- Routes/controllers/services directories created empty for future use
- Edge Functions remain untouched in Supabase

**4. No Integration**
- Frontend continues using Supabase (no changes to AuthContext, API calls, etc.)
- Edge Functions continue running
- No environment variable connections between systems

### Implementation Approach
Create all backend files using `code--write`. Each file is isolated with no dependencies on existing code.

