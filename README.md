# THE 1970 Storefront

One Next.js/TypeScript codebase for two domains/markets:
- `the1970.vn` -> Vietnamese / VND / domestic checkout
- `the1970.co` -> English / USD / Shopify checkout

## Run
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Architecture
- `lib/market.ts`: detects market from Host header.
- `lib/core-api.ts`: server-side adapter to the read-only Core API storefront endpoints. Includes demo fallback for initial UI work.
- `app/[slug]`: keeps product URLs at root (`/quan-jean-xanh-qj210`) so old URLs can be preserved when migrating SEO.
- `app/collections/[slug]`: collection pages.
- Next Image creates responsive AVIF/WebP renditions; master image URLs stay in Core API/Cloudinary.

## Required Core API contract
Do **not** expose the current admin `/products` endpoint directly because it is authenticated and includes internal data. Add public read-only endpoints such as:
- `GET /storefront/products`
- `GET /storefront/products/:slug`
Return only public fields: id, slug, name, description, category, imageUrl, variants `{id, sku, color, size, selling price, public stock/availability, imageUrl}`. Never return costPrice or branch-level inventory.

## Deployment / DNS cutover
Deploy this repo first (Vercel or Railway), attach `the1970.vn` and `the1970.co`, verify both on temporary deployment URLs, then change DNS at the DNS provider/Nhân Hòa. Keep old hosting active until SSL and redirects are verified.

## Important pricing rule
VN and international selling prices must be stored explicitly. The storefront does **not** convert VND to USD automatically. For INTL it looks for `priceUsd`, `usPrice`, or `internationalPrice`.

## Safe use of current protected Core API
For the first deployment the Next.js server can call the existing protected `/products` routes with `CORE_API_TOKEN` (server-only env). `lib/core-api.ts` immediately strips internal fields and never sends `costPrice` or branch inventory to client components. Long-term, a dedicated read-only `/storefront/*` API is cleaner.
