# Samya By Samishtha

Premium artificial & fashion jewellery e-commerce site with a full storefront
(shop by category, product pages, cart, checkout) and an admin backend portal
(products, categories, orders).

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- JWT-based admin authentication (httpOnly cookie)

## Getting Started

```bash
npm install
cp .env.example .env   # then edit JWT_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD
npx prisma db push
npm run db:seed
npm run dev
```

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
