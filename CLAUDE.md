# Samya By Samishtha — project guide for Claude

Live custom e-commerce site for premium artificial/fashion jewellery.
Domain: samyabysamishtha.com (GoDaddy DNS → Vercel). The owner is non-technical, writes in
Hinglish, and gives short feature/bug requests. Reply in simple Hinglish, keep answers brief.

## Workflow
- Develop on branch `claude/samya-ecommerce-site-6l4cri`; pushing auto-deploys to production on Vercel.
- Before pushing run `npx tsc --noEmit -p .` and `npx next lint` (a lint error breaks the deploy).
- Build command is `prisma generate && prisma db push --accept-data-loss --skip-generate && next build`,
  so Prisma schema changes apply to the live DB on deploy. Be careful with destructive schema changes.
- Do not create PRs unless asked. Never put secrets in the repo; env var names only.
- The sandbox cannot reach the production database or live site. For bulk data changes, generate a
  console script the owner pastes into their logged-in admin browser tab (see "Bulk import").

## Stack
Next.js 14 App Router, TypeScript, Tailwind, Prisma + PostgreSQL, Supabase Storage (admin-uploaded
images), Resend (email), Razorpay (payments), `pdf-lib` (invoices), `sharp` (image conversion),
Meta Pixel + Meta product feed, Tawk.to chat widget.

## Environment variables (set in Vercel; see `.env.example`)
DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD (only seeds the first admin),
SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY / SUPABASE_BUCKET, RESEND_API_KEY,
RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET, NEXT_PUBLIC_TAWKTO_PROPERTY_ID / WIDGET_ID,
NEXT_PUBLIC_META_PIXEL_ID (defaults to the hardcoded ID in `MetaPixel.tsx`), NEXT_PUBLIC_SITE_URL,
GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID (Google reviews section on the homepage; hidden if unset), INVOICE_GSTIN (optional override; default is `BUSINESS_GSTIN` in `src/lib/constants.ts`).

## Business rules (all prices stored in paise; `formatINR` in `src/lib/format.ts`)
Pricing lives in `src/lib/orders.ts` `quoteOrder` (server is the source of truth); cart/checkout use the same
pure function `computeAutoPricing` in `src/lib/offers.ts`. Automatic offers are admin-editable DB rows
(`Offer` model; Admin → Coupons → "Automatic Offers"), loaded via `getActiveOffers()` (`src/lib/offersServer.ts`,
which seeds the original offers once) and passed to the client by `OffersProvider` in `(site)/layout.tsx`.
Offer kinds: BUNDLE (any N matching items at a flat price; match by SKU list or category keyword; final price,
excluded from other discounts), PERCENT (best single % wins; optional min cart and "subscribers only"),
PREPAID_PERCENT (extra % for Razorpay). Offers can be switched off or date-scheduled. Seeded defaults:
3 Earrings @₹599, 3 Bangles (KR-172..KR-187) @₹699, 20% on ₹1000+, 10% for subscribers (email via welcome
popup/footer → `Subscriber` table + `sbs_welcome_email` cookie, `src/lib/welcome.ts`), extra 5% prepaid.
Coupon codes (`Coupon` model) compete with the % offer (don't stack). COD adds ₹49.
Other rules: Gifting category / Build-Your-Own bouquet & hamper items are prepaid only and non-returnable;
return window shown is 3 days (`ProductTrustBadges.tsx`, policy page); GST 3% inclusive, HSN 7117,
CGST+SGST if customer state contains "delhi", else IGST.

## Where things are
- Storefront: `src/app/(site)/*`; header/footer menus are built from DB categories in `(site)/layout.tsx`.
- Admin: `src/app/admin/(protected)/*` — products (Display Order `sortOrder`), categories (Menu order), orders
  (COD/Prepaid badge, status updates), hero banners (auto-resized via `/api/admin/banner-upload`), reviews
  (need approval), coupons, customers, subscribers (+CSV export), traffic, blog.
- Auth: customer + admin JWT cookies (`src/lib/auth.ts`); both have forgot/reset password flows.
- Emails: `src/lib/email.ts` (Resend; from orders@samyabysamishtha.com, reply-to care@samyabysamishtha.com,
  admin notifications to npsretailsolutions@gmail.com). Sends are awaited inside `createOrderRecord`
  (Vercel kills fire-and-forget work). Customer confirmation attaches the invoice PDF (`src/lib/invoice.ts`).
- Meta: feed at `/feed/meta.xml` (`src/app/feed/meta.xml/route.ts`); Pixel in `src/components/MetaPixel.tsx`,
  events via `src/lib/metaPixel.ts` / `PixelEvent.tsx` (ViewContent, AddToCart, InitiateCheckout, Purchase).
  Pixel dataset "Samya Website" ID 2108551593087871. Conversions API is NOT implemented.
- Product images: committed under `public/images/products/<category>/` (webp) or uploaded to Supabase.
- Delhivery and WhatsApp integrations were built and then removed at the owner's request; the DB columns
  `trackingNumber/shippingProvider/shippingStatus/shippingError` remain.

## Bulk import workflow (adding many products)
Convert images to webp with sharp into `public/images/products/<category>/`, commit them, produce product JSON,
and give the owner a one-line console script that POSTs to `/api/admin/bulk-import` (and
`/api/products/[id]/variants` for sizes/colours) from their logged-in admin tab. `bulk-import` sets
`isGiftable` false.

## Gotchas learned
- Earring detection must use category name/slug *contains* "earring"; cart items saved before a deploy may need
  re-adding.
- Never `pkill -f "next start"` in the same Bash call as other commands (kills the shell).
- A local `next build` fails at sitemap prerender if Postgres isn't running locally — not a code bug.
- Local Prisma client must be regenerated (`npx prisma generate`) after schema edits before typechecking.
