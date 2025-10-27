# Winner SOP Backend (NestJS)

Backend API built with NestJS and Prisma.

## Tech Stack
- NestJS 10
- Prisma 5 (MongoDB provider)
- TypeScript

## Getting Started

1. Install dependencies
   - Using pnpm: `pnpm install`

2. Environment
   - Copy `.env.example` to `.env` and adjust values
   - Ensure MongoDB is running and `DATABASE_URL` is correct

3. Prisma
   - Generate client: `pnpm prisma generate`
   - Push schema: `pnpm prisma db push`

4. Run
   - Dev: `pnpm start:dev`
   - Prod build: `pnpm build` then `node dist/main.js`

## Scripts
- `start` – Run Nest app
- `start:dev` – Watch mode
- `build` – Compile TypeScript
- `lint` – ESLint with Prettier config

## Code Style
- ESLint config in `.eslintrc.js`
- Prettier config in `.prettierrc`

## Notes
- Prisma is configured for MongoDB. If you switch databases, update `provider` and adjust id/relations accordingly in `prisma/schema.prisma`.
- JWT secret reads from `JWT_SECRET` with a dev fallback.
