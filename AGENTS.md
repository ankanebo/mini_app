# Repository Guidelines

## Project Structure & Module Organization
- App entry: `App.tsx` wraps `frontend` navigation with Apollo client.
- Frontend lives in `frontend/src` (navigation, screens, components, theme, graphql); shared assets in `assets/`.
- Backend GraphQL API in `backend/src` with Prisma schema at `backend/prisma/schema.prisma`; generated client outputs to `backend/node_modules/.prisma`.
- Tooling configs: `tsconfig.json`, `eslint.config.js`, `app.json`; utility scripts in `scripts/`.

## Build, Test, and Development Commands
- Install dependencies: `npm install` (root) and `cd backend && npm install`.
- Run Expo app: `npm start` (or `npm run android` / `ios` / `web`) from repo root.
- Lint TypeScript/JS: `npm run lint`.
- Reset to a clean Expo starter: `npm run reset-project`.
- Backend dev server: `cd backend && npm run dev` (uses `ts-node-dev`).
- Prisma client/schema: `cd backend && npm run prisma:generate`; run migrations with `npm run prisma:migrate` (requires `DATABASE_URL`).

## Coding Style & Naming Conventions
- TypeScript-first; React function components with hooks.
- Prefer 2-space indentation, semicolon-free (Expo default), and single quotes.
- Component files and React components in `PascalCase` (`RootNavigator.tsx`, screens); hooks/utilities in `camelCase`.
- Keep GraphQL client code under `frontend/src/graphql` and navigation-only logic in `frontend/src/navigation`.
- ESLint uses `eslint-config-expo`; resolve lint warnings before pushing.

## Testing Guidelines
- No automated test harness is present yet; add targeted tests alongside features (`*.test.ts` / `*.test.tsx`) using Jest/React Native Testing Library when introduced.
- For backend schema changes, run `npm run prisma:generate` and validate basic queries against the dev server.
- Perform manual app smoke checks per platform (navigation flows, data fetches) before merging.

## Commit & Pull Request Guidelines
- Use clear, present-tense commit subjects (e.g., `Add satellite detail query`); group related changes.
- For PRs, include a concise summary, linked issues/task IDs, key screenshots for UI updates, and notes on manual testing steps (`npm run lint`, platform smoke checks).
- Call out schema or migration changes and include any required `.env` updates (never commit secrets).

## Security & Configuration Tips
- Backend requires `DATABASE_URL` (MySQL) in `backend/.env`; do not commit secrets.
- Review Prisma relation changes carefully; regenerate the client after edits.
- Keep third-party API keys out of source and prefer Expo/OS keychain storage when added.
