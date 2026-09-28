# Samya By Samishtha

Premium artificial & fashion jewellery e-commerce site with a full storefront
(shop by category, product pages, cart, checkout) and an admin backend portal
(products, categories, orders).

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- JWT-based admin authentication (httpOnly cookie)

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL / JWT_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD
npx prisma db push
npm run db:seed
npm run dev
```

`DATABASE_URL` must point at a PostgreSQL database (Vercel Postgres, Neon,
Supabase, etc. all work). See "Deploying to Vercel" below.

## Deploying to Vercel

1. In the Vercel dashboard, create a Postgres database (Storage tab → Create
   Database → Postgres) and connect it to this project — Vercel adds the
   `DATABASE_URL`/`POSTGRES_*` env vars for you automatically.
2. Add these Project → Settings → Environment Variables manually:
   - `JWT_SECRET` — any long random string
   - `ADMIN_EMAIL` — the email you'll log into `/admin` with
   - `ADMIN_PASSWORD` — used only by the seed script (see step 4)
3. Deploy the project (import the GitHub repo, branch
   `claude/samya-ecommerce-site-6l4cri`, or your default branch after
   merging). The build runs `prisma generate && next build` automatically.
4. Create the database tables and seed data once, from your machine, pointed
   at the production database:
   ```bash
   vercel env pull .env.production.local
   DATABASE_URL="<paste the production DATABASE_URL>" npx prisma db push
   DATABASE_URL="<same>" ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node prisma/seed.mjs
   ```
   (Re-running `db:seed` wipes and re-creates products/categories/orders —
   only do this once, or write real product data through the admin portal
   afterwards instead of re-seeding.)

Visit `http://localhost:3000` for the storefront and
`http://localhost:3000/admin/login` for the admin portal (credentials come
from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, seeded by `db:seed`).

## Project Structure

- `src/app/(site)` – storefront pages (home, shop, product, cart, checkout)
- `src/app/admin` – admin portal (login + protected dashboard/products/orders/categories)
- `src/app/api` – REST API routes for orders, products, categories, admin auth
- `prisma/schema.prisma` – database schema
- `prisma/seed.mjs` – seed script (categories, sample products, admin user)
- `public/images/products` – generated placeholder product imagery (swap with
  real product photography any time via the admin Products form)

## Replacing Placeholder Images

Product photos are currently generated placeholder SVGs. Swap them by editing
a product in the admin portal and pasting real image URLs (or paths under
`public/images/products/`).
