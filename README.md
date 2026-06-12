# Solar Glow ✦

A solar e-commerce catalogue with a **futuristic glossy editorial** design — print-inspired
typography, large visuals, and a fully split front/back architecture.

## Architecture

```
solar-glow/
├── frontend/   React 18 + Vite + Tailwind (the storefront)
└── backend/    Laravel 12 + Filament v5.6 (REST API + admin dashboard)
```

- The frontend talks to the backend **only** through the REST API (`/api/*`), proxied by Vite in dev.
- The admin dashboard is Filament v5 at `http://127.0.0.1:8000/admin`.
- Database: SQLite (zero-config) with constant/lookup tables (`categories`, `order_statuses`, `settings`) and full seeders.

## Run it

```bash
# Backend (API + Filament admin) — http://127.0.0.1:8000
cd backend
composer install
cp .env.example .env && php artisan key:generate   # first time only
php artisan migrate --seed
php artisan serve

# Frontend (storefront) — http://localhost:3000
cd frontend
npm install
npm run dev
```

### Admin access

Panel: `http://127.0.0.1:8000/admin` — the seeder creates the admin from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` in `backend/.env`. If `ADMIN_PASSWORD` is unset, a random password is
generated and printed **once** during `php artisan migrate --seed`. Only the configured
`ADMIN_EMAIL` may access the panel (`User::canAccessPanel`).

## API

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/api/categories`       | Active categories with product count |
| GET    | `/api/products`         | Catalogue (`?category=&search=&featured=`) |
| GET    | `/api/products/{slug}`  | Product detail with spec sheet       |
| POST   | `/api/orders`           | Place an order (prices recalculated server-side) |
| GET    | `/api/orders/{ref}`     | Track an order by reference (`SG-XXXXXXXX`) |
| GET    | `/api/faqs`             | Active FAQs                          |
| GET    | `/api/testimonials`     | Active testimonials                  |
| POST   | `/api/contact`          | Contact message                      |

Write endpoints are rate-limited (`throttle:10,1`); orders run in a DB transaction with
row locks, stock checks, and server-side totals.

## Security notes

- No credentials or API keys live in the frontend (the old hardcoded Supabase keys and
  dashboard password were removed along with Supabase itself).
- Admin auth is session-based via Filament; storefront needs no auth.
- All input validated via FormRequests; output shaped by API Resources.
