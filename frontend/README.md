# School Test Frontend

A Next.js (App Router) frontend for a competency-based assessment platform with three roles: STUDENT, ADMIN, and SUPERVISOR. Uses TypeScript, Redux Toolkit, shadcn/ui, and Tailwind CSS.

## Quick start

- Install Yarn (see below)
- Copy envs and set API base URL
- Install deps and run the dev server

```bash

# 1) Install dependencies
yarn install

# 2) Start dev server
yarn dev
```

App routes:
- / — dashboard/landing
- /login — sign in
- /register — sign up
- /assess — start/continue assessment (student)
- /certificate — view certificate (student)
- /admin — admin console
- /supervisor — supervisor console

## 1) Install Yarn

Recommended (Corepack, ships with recent Node):

```bash
# ensure Node is installed (18+ recommended)
node -v

# enable Corepack to manage Yarn
corepack enable

# optional: pin/activate the latest stable Yarn if needed
corepack prepare yarn@stable --activate

# verify
yarn -v
```

Alternative (npm with Node):

```bash
# install Yarn globally via npm (Yarn Classic)
npm install --global yarn
# verify
yarn -v
```


Tip: If you use nvm, install a recent Node and re-run corepack enable.

## 2) Login and roles

Use the appropriate credentials for each role:
- STUDENT — use student-provided credentials to access assessment flows
- ADMIN — use admin credentials to access /admin
- SUPERVISOR — use supervisor credentials to access /supervisor

Note: Credentials are provisioned by the backend. If you don’t have them, request an account or seed data on the backend as applicable.

Login page: /login. After login, users are redirected based on role.

## 3) Admin setup: seed questions

Before students can take exams, the ADMIN should add questions. From the Admin console:

- Navigate to /admin → “Questions” tab
- Use the testing-only seed controls at the top of the Create Question dialog:
  - Seed Competencies — seeds sample competencies
  - Seed Questions — seeds sample questions
  - Seed All — seeds both at once

You can also create, edit, activate/deactivate, and delete questions in the same tab.

## 4) Reset exam attempts (Admin/Supervisor)

- Admin: /admin → “Exams” tab → click “Reset” for a student’s attempt
- Supervisor: /supervisor console → click “Reset” in the exams table

Effects:
- Resets the selected exam attempt for that step/level
- For Step 1, any Step 1 lock will be cleared as part of the reset

## 5) MVP status and limitations

This is an MVP. Some areas are intentionally minimal and will be expanded:
- Proper error handling and user feedback in edge cases
- Input validation and UX polish in forms
- Robust empty/loading states



## Scripts

- yarn dev — run the dev server (Next.js)
- yarn build — production build
- yarn start — start the production server
- yarn lint — lint

## Troubleshooting

- 401/Not authenticated: verify NEXT_PUBLIC_API_BASE is correct and your backend is running; ensure cookies are allowed in the browser.
- Can’t see Admin/Supervisor pages after login: make sure the logged-in account has the expected role from the backend.
- Missing questions: seed via Admin → Questions tab, or create your own.

## Tech stack

- Next.js 15, React 19, TypeScript
- Redux Toolkit, react-redux
- Tailwind CSS, shadcn/ui (Radix UI)
