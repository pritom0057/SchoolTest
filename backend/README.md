# Test School Backend (MVP)

Node.js + Express (TypeScript) backend for a simple exam system. This is an MVP — features may evolve and some areas are intentionally minimal.

## Requirements

- Node.js 18+
- MongoDB 7+ (local or Docker)

If you don’t have MongoDB locally, you can run it in Docker (same as in `commands.txt`):

```
docker run -d --name mongo \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  mongo:7
```

You can also start an existing container later with:

```
npm run db
```

## Quick start

1) Configure environment variables (see .env.example) — create a `.env` file in the project root.
2) Install dependencies:

```
npm install
```

3) Start MongoDB (local or Docker).
4) Run the API in development:

```
npm run dev
```

By default the server listens on port 8080. Base URL:

- http://localhost:8080/api

## Environment variables

All variables and defaults are defined in `src/config/env.ts`. A ready-to-copy template is provided in `.env.example`.

Key settings:

- PORT: API port (default: 8080)
- MONGODB_URI: Mongo connection string (default: mongodb://127.0.0.1:27017/test_school)
- JWT_ACCESS_SECRET, JWT_REFRESH_SECRET: secrets for signing tokens
- ACCESS_TTL, REFRESH_TTL: token lifetimes (e.g., 15m, 30d)
- OTP_TTL_MINUTES: OTP expiry window (default: 10)
- MAIL_*: optional SMTP settings; when not configured, emails are mocked to console

## Auth flow and endpoints

Base path for auth: `/api/auth`

- POST /api/auth/register
  - Purpose: Create a user and issue an OTP for email verification
  - Body:
    - name: string (min 2)
    - email: string (email)
    - password: string (min 6)
    - phone?: string
  - Notes:
    - The OTP is saved to the database and, in non-production, is also returned in the response for convenience and logged to console/mail mock.

- POST /api/auth/verify-otp
  - Purpose: Verify the OTP tied to the email
  - Body:
    - email: string (email)
    - otp: string (4–8 chars)

- POST /api/auth/login
  - Purpose: Login with verified account
  - Body:
    - email: string (email)
    - password: string (min 6)
  - Returns:
    - JSON: `{ ok: true, accessToken }`
    - Also sets an HttpOnly `refreshToken` cookie for session continuity

- POST /api/auth/refresh
  - Purpose: Rotate refresh token and get a fresh access token

- POST /api/auth/logout
  - Purpose: Revoke the current refresh token and clear cookie

Health check: `GET /api/health` → `{ status: 'ok' }`

## User roles and how to change them

Roles: `ADMIN`, `SUPERVISOR`, `STUDENT` (default on registration is `STUDENT`). Some routes require elevated roles (e.g., question and policy management).

Current options to promote a user:

- Option A (immediate): Use MongoDB Compass or the Mongo shell to update the user’s `role` field manually.
  - Steps:
    1. Register a user via `POST /api/auth/register` and complete OTP verification.
    2. In MongoDB Compass, open the `users` collection and set `role` to `ADMIN` or `SUPERVISOR`.

- Option B (once you have an admin): Use the protected API endpoint
  - Endpoint: `POST /api/users/role`
  - Auth: Bearer access token of an `ADMIN`
  - Body: `{ "userId": "<user_id>", "role": "ADMIN" | "SUPERVISOR" | "STUDENT" }`

Better long-term solution (suggested):

- Add a one-time bootstrap admin on first run (e.g., via `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` env vars), or provide a small CLI/script/endpoint guarded by a setup token. This avoids manual DB edits and keeps the flow auditable.

## OTP delivery (current behavior)

- OTPs are stored on the user document with an expiry window (configurable via `OTP_TTL_MINUTES`).
- In development/non-production, the OTP is returned by the register endpoint and printed to the console. Email and SMS are mocked by default until SMTP/SMS providers are configured.
  - Email mock: logged from `src/utils/mailer.ts`
  - SMS mock: logged from `src/utils/sms.ts`

## Seeding data

Seed routes exist for competencies/questions but require an `ADMIN` token:

- `POST /api/seed/competencies`
- `POST /api/seed/questions`
- `POST /api/seed/all`

## Scripts

- `npm run dev` — start the dev server with tsx watch
- `npm run build` — compile TypeScript
- `npm start` — run compiled output from `dist`
- `npm run db` — start an existing Docker container named `mongo`

## Tech stack

- Express 5, TypeScript, Mongoose
- Zod for request validation
- JWT for auth (access + rotating refresh in HttpOnly cookie)
- Nodemailer mock for email, console mock for SMS

## MVP status

This is a Minimum Viable Product. Expect changes and some unstable areas. Please report issues and suggestions.
