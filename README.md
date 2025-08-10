# Test School — Full‑Stack App (Frontend + Backend)

A simple competency assessment platform with three roles: STUDENT, ADMIN, and SUPERVISOR. It includes a Node/Express (TypeScript) API and a Next.js (App Router) frontend, using TypeScript, Redux Toolkit, shadcn/ui, and Tailwind CSS.

Note: This project is currently in MVP stage; features and flows may change.

- Frontend: Next.js 15, React 19, TypeScript, Redux Toolkit
- Backend: Express 5 (TypeScript), Mongoose, Zod, JWT (access + rotating refresh in HttpOnly cookie)
- OTP delivery: Email/SMS mocked in development; OTP is returned by the API on register in non‑production for convenience

## Monorepo layout

- backend/ — Express + MongoDB API (TypeScript)
- frontend/ — Next.js app (TypeScript + App Router)

Key routes (frontend):
- / — dashboard/landing
- /login — sign in
- /register — sign up (with OTP verification)
- /assess — start/continue assessment (student)
- /certificate — view certificate (student)
- /admin — admin console
- /supervisor — supervisor console

## Prerequisites

- Node.js 18+
- MongoDB 7+ (local install or Docker)

Optional: Yarn (recommended via Corepack) for the frontend. npm also works if you prefer.

## Quick start

1) Backend (API)
- Copy envs and install deps
- Start MongoDB
- Run the API

```bash
# from repo root
cd backend

# create .env (see .env.example and src/config/env.ts for defaults)
# Example minimal .env:
# PORT=8080
# MONGODB_URI=mongodb://127.0.0.1:27017/test_school
# JWT_ACCESS_SECRET=dev-access-secret
# JWT_REFRESH_SECRET=dev-refresh-secret
# OTP_TTL_MINUTES=10

npm install
# start Mongo (local) or via Docker (see backend/README.md for a docker run command)
npm run dev
# API defaults to http://localhost:8080 (see PORT)
```

2) Frontend (Next.js)
- Point the app at your API
- Install deps and run the dev server

```bash
# in a second terminal, from repo root
cd frontend

# create .env.local with your API origin (do not include /api)
# Example:
# NEXT_PUBLIC_API_BASE=http://localhost:8080

# Yarn (recommended)
yarn install
yarn dev

# or with npm
# npm install
# npm run dev
```

Now open http://localhost:3000 (default Next.js dev port).

## Full application flow

### 1) Registration and OTP verification (Student/Admin/Supervisor)

- User registers at /register with name, email, password, and optional phone.
- Backend creates the user and issues an OTP (saved to DB). In non‑production, the OTP is also returned in the response for convenience and printed to console via mock email/SMS.
- The Register page shows an OTP input after successful registration. Enter the code and verify to activate the account.
- If a user tries to register again with the same email and it’s not yet verified, the backend re‑issues a new OTP instead of blocking the registration.
- If a user tries to login with correct credentials but the account is not verified, the backend re‑issues an OTP and rejects login. The Login page switches to a verification step so the user can enter the code and continue.

Notes:
- In development, OTP is logged as [MAIL MOCK]/[SMS MOCK] in the backend console and returned from register.
- In production, configure SMTP/SMS providers and OTP will be delivered via email/SMS; it won’t be returned in the response.

### 2) Login and role‑based redirects

- After verifying, login at /login.
- On success, users are redirected based on role:
  - ADMIN → /admin
  - SUPERVISOR → /supervisor
  - STUDENT (default) → /

### 3) Assessment flow (Student)

- Navigate to /assess to start or continue the competency assessment.
- The backend is the source of truth for progression, eligibility, and step locks. The UI reads status from /api/users/me and plan metadata for question counts.
- Timing per question and eligibility logic are enforced server‑side.

### 4) Admin console

- Open /admin and use the “Questions” tab to manage the question bank.
- Features:
  - Create questions (dialog), with options having required keys and a correct answer flag
  - Edit, activate/deactivate, and delete questions
  - Filter by level, server‑side pagination with per‑page selector
  - Seed sample competencies/questions via testing‑only buttons in the Create Question dialog
- Competencies: create, edit, and delete (with dialogs), and link questions to competencies.
- Exams: view attempts, reset an attempt (Step‑scoped; Step 1 reset also clears the Step 1 lock).

### 5) Supervisor console

- Open /supervisor to oversee exams. Supervisors can reset attempts where permitted and view statuses similar to Admin, with scoped permissions.

## Seeding data (Admin)

Use the Admin → Questions tab testing controls to:
- Seed Competencies — sample competencies
- Seed Questions — sample questions (marks correct option as “(correct)” in the seed data)
- Seed All — both at once

Seeding routes exist server‑side and are protected by ADMIN auth.

## Environment variables (high level)

Backend (see backend/src/config/env.ts and backend/.env.example):
- PORT (default: 8080)
- MONGODB_URI (default: mongodb://127.0.0.1:27017/test_school)
- JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
- ACCESS_TTL, REFRESH_TTL
- OTP_TTL_MINUTES
- MAIL_* (optional SMTP; when not set, email is mocked to console)

Frontend (frontend/.env.local):
- NEXT_PUBLIC_API_BASE — API origin, e.g., http://localhost:8080

## Troubleshooting

- 401/Not authenticated: Ensure the backend is running, NEXT_PUBLIC_API_BASE is correct, and the browser allows cookies for http://localhost:3000.
- Can’t login (unverified): Try logging in again; the backend re‑issues an OTP and the login page will switch to verification mode.
- OTP not received: In development, check the backend terminal logs ([MAIL MOCK]/[SMS MOCK]) and the register response body; in production, configure SMTP/SMS.
- Admin data missing: Use the seed buttons in Admin → Questions.
- Ports: If your backend port isn’t 8080, set the exact origin in frontend .env.local.

## Scripts

Backend:
- npm run dev — start API in watch mode
- npm run build — compile TypeScript
- npm start — run compiled API
- npm run db — start an existing Docker Mongo container

Frontend:
- yarn dev — run Next.js dev server
- yarn build — production build
- yarn start — start production server
- yarn lint — lint

## Tech stack

- Backend: Express 5, TypeScript, Mongoose, Zod, JWT
- Frontend: Next.js 15, React 19, TypeScript, Redux Toolkit, shadcn/ui (Radix UI), Tailwind CSS
