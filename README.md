# TinyLink 🔗

TinyLink is a production-quality, high-performance SaaS URL shortener built with a modern React + TypeScript frontend and a FastAPI (Python) backend, with Razorpay billing and Clerk authentication.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                                 │
│   React 19 + Vite  ·  Apollo Client (GraphQL)  ·  Clerk SDK (Auth)     │
│   Razorpay Checkout JS  ·  Recharts  ·  TailwindCSS v4                  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │  HTTPS
          ┌────────────────▼──────────────────┐
          │         Vercel (CDN/Edge)          │
          │      Static SPA — frontend/dist    │
          └────────────────┬──────────────────┘
                           │  API calls
          ┌────────────────▼──────────────────┐
          │      Render.com — FastAPI          │
          │   uvicorn app.main:app             │
          │                                   │
          │  ┌──────────┐  ┌───────────────┐  │
          │  │ /graphql │  │  REST routes   │  │
          │  │Strawberry│  │ /{short_code}  │  │
          │  │  GraphQL │  │ /api/payment/* │  │
          │  └────┬─────┘  │ /api/webhooks/ │  │
          │       │        └───────┬────────┘  │
          │  ┌────▼──────────────▼────────┐  │
          │  │   SQLAlchemy ORM Layer      │  │
          │  └────┬────────────┬──────────┘  │
          └───────┼────────────┼─────────────┘
                  │            │
    ┌─────────────▼──┐   ┌────▼────────────────┐
    │   Supabase     │   │  Upstash Redis REST  │
    │  PostgreSQL DB │   │  (Cache + RateLimit) │
    └────────────────┘   └─────────────────────┘

External Services:
  Clerk      — JWT auth + user webhooks
  Razorpay   — payment order creation + HMAC verification
  Brevo      — transactional emails (plan upgrade / link created)
```

---

## Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, TypeScript, Apollo Client v4, Clerk React, TailwindCSS v4, Framer Motion, Recharts |
| **Backend** | FastAPI, Strawberry GraphQL, SQLAlchemy 2, Uvicorn, python-jose |
| **Auth** | Clerk (JWKS-based JWT verification on every request) |
| **Payments** | Razorpay REST API — order creation + HMAC-SHA256 signature verification |
| **Database** | PostgreSQL via Supabase (connection pooling via PgBouncer port 6543) |
| **Cache / Rate-limit** | Upstash Redis REST API |
| **Email** | Brevo (Sendinblue) transactional API |
| **Frontend Hosting** | Vercel (static SPA + `vercel.json` SPA rewrites) |
| **Backend Hosting** | Render.com (web service) |

---

## API Reference

### 1. GraphQL API — `/graphql`

All operations require `Authorization: Bearer <ClerkJWT>` header.
Strawberry automatically converts Python `snake_case` field names to GraphQL `camelCase`.

#### Queries

| Query | Arguments | Returns | Description |
| :--- | :--- | :--- | :--- |
| `me` | — | `UserType` | Authenticated user profile + current subscription plan |
| `myUrls` | `page`, `limit`, `search`, `status`, `orderBy` | `PaginatedURLsType` | Paginated user link list with filtering |
| `url` | `id: UUID!` | `ShortURLType` | Single link by ID (owner only) |
| `urlByCode` | `shortCode: String!` | `ShortURLType` | Metadata by short code (no click tracking) |
| `expiredUrls` | — | `[ShortURLType]` | All expired links for current user |
| `favoriteUrls` | — | `[ShortURLType]` | All favourited links |
| `analytics` | `urlId: UUID!`, `days: Int` | `AnalyticsType` | Click analytics (daily, browser, device, country, referrer) |
| `dashboardStats` | — | `DashboardType` | Aggregate stats for dashboard |

#### Mutations

| Mutation | Arguments | Returns | Description |
| :--- | :--- | :--- | :--- |
| `createShortUrl` | `input: CreateShortURLInput!` | `ShortURLType` | Create a new short link |
| `updateShortUrl` | `id: UUID!`, `input: UpdateShortURLInput!` | `ShortURLType` | Update link properties |
| `deleteShortUrl` | `id: UUID!` | `ShortURLType` | Soft-delete a link |
| `restoreShortUrl` | `id: UUID!` | `ShortURLType` | Restore a soft-deleted link |
| `toggleFavorite` | `id: UUID!` | `ShortURLType` | Star / unstar a link |
| `generateQrCode` | `id: UUID!` | `String` | Base64 PNG QR code data URI |

**Input types (camelCase in GraphQL):**
```graphql
input CreateShortURLInput {
  originalUrl: String!
  customAlias: String
  expiresAt:   DateTime
  title:        String
}

input UpdateShortURLInput {
  customAlias: String
  expiresAt:   DateTime
  isActive:    Boolean
  title:        String
}
```

---

### 2. REST API Endpoints

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/{short_code}` | None | Redirect — checks rate limit → Redis cache → DB → 301 |
| `GET` | `/health` | None | Health probe |
| `POST` | `/api/webhooks/clerk` | SVIX signature | Clerk user sync webhook |
| `POST` | `/api/payment/order` | Bearer JWT | Create Razorpay order for a plan |
| `POST` | `/api/payment/verify` | Bearer JWT | Verify HMAC signature + upgrade user plan |
| `GET` | `/api/payment/plans` | None | Return plan catalogue (prices, features) |

---

## Environment Configuration

### Backend — `backend/.env`

```dotenv
# Database
DATABASE_URL=postgresql://user:pass@host:6543/postgres

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_xxxx

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx

# CORS & URLs
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
SHORT_URL_BASE=https://your-backend.onrender.com

# Razorpay  ← REQUIRED for payments.  Set these on Render's environment tab.
RAZORPAY_KEY_ID=rzp_live_xxxx          # or rzp_test_xxxx for test mode
RAZORPAY_KEY_SECRET=xxxx

# Brevo (Email)
BREVO_API_KEY=xxxx
BREVO_SENDER_EMAIL=you@example.com
BREVO_SENDER_NAME=TinyLink
```

> ⚠️ **Razorpay 401 / 502 on production?**
> The `Razorpay error 401: Authentication failed` means `RAZORPAY_KEY_ID` and/or
> `RAZORPAY_KEY_SECRET` are **not set** (or wrong) in the Render service's Environment tab.
> Go to **Render Dashboard → your service → Environment → Add env vars** and paste the keys.
> After saving, Render will redeploy automatically.

### Frontend — `frontend/.env.local`

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxx

# IMPORTANT: VITE_API_URL must be the BARE base URL — NO trailing /graphql suffix.
# Wrong ❌:  https://tinylink-57eg.onrender.com/graphql
# Correct ✅: https://tinylink-57eg.onrender.com
VITE_API_URL=https://tinylink-57eg.onrender.com

# Full GraphQL endpoint (= VITE_API_URL + /graphql)
VITE_GRAPHQL_URL=https://tinylink-57eg.onrender.com/graphql

VITE_SHORT_URL_BASE=https://tinylink-57eg.onrender.com
```

> ⚠️ **`/graphql/api/payment/order` 404?**
> This happens when `VITE_API_URL` is accidentally set to the `/graphql` endpoint.
> Set `VITE_API_URL` to the **bare backend origin** (no path). The code defensively
> strips any trailing `/graphql` suffix but the environment variable should be correct.

> ⚠️ **Vercel env vars:** Set the above in **Vercel Dashboard → Project → Settings → Environment Variables**.

---

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev           # dev server at http://localhost:5173
npm run build         # production build → dist/
```

---

## Deployment

### Backend → Render

1. Connect your GitHub repo to Render as a **Web Service**
2. Set **Root Directory** to `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from the backend table above in **Environment → Add env vars**

### Frontend → Vercel

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Add all `VITE_*` environment variables in **Project Settings → Environment Variables**
4. The `vercel.json` in `frontend/` handles SPA routing rewrites automatically

---

## Subscription Plans

| Plan | Price | Links | Analytics | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | ₹0/mo | 25 | 7-day history | Basic QR codes |
| **Pro** | ₹499/mo | 500 | 90-day history | Custom aliases, Link expiry, Priority support |
| **Enterprise** | ₹1,999/mo | Unlimited | Unlimited | Custom domains, Bulk import/export, Dedicated support, SLA |

Plans auto-expire after 30 days and downgrade to Free if not renewed.