# TinyLink

TinyLink is a production-quality, high-performance SaaS URL shortener built with a modern React + TypeScript frontend and a FastAPI (Python) backend.

## System Architecture

Below is the technical architectural flow diagram:

![TinyLink System Architecture](docs/architecture.png)

Detailed architecture documents and layouts are available at:
* **Interactive Mermaid Schema:** [docs/architecture.md](docs/architecture.md)
* **ASCII Layout Flowchart:** [docs/architecture_diagram.txt](docs/architecture_diagram.txt)

---

## Technical Stack

* **Frontend:** React 19, Vite, TypeScript, Apollo Client (GraphQL), Axios (REST), Clerk (Auth), TailwindCSS, Recharts.
* **Backend:** FastAPI, Strawberry GraphQL, SQLAlchemy, Uvicorn, Python-Jose (Clerk JWT token verification).
* **Database & Caching:** PostgreSQL (Primary DB), Redis / Upstash Redis (redirection cache & rate-limiting).

---

## API Reference

### 1. GraphQL API (Endpoint: `/graphql`)

All GraphQL operations require high-level Bearer token verification (Clerk Session JWT passed in custom headers).

#### **Queries (Read Operations)**

* **`me: UserType!`**
  * *Description:* Returns the current authenticated user profile attributes (`id`, `email`, `displayName`, `createdAt`).
* **`myUrls(page: Int, limit: Int, search: String, status: String, orderBy: String): PaginatedURLsType!`**
  * *Description:* Paginated lookup of links. Filters: `status` (`active`, `expired`), `search` (custom match), `orderBy` (`newest`, `oldest`, `clicks`).
* **`url(id: UUID!): ShortURLType!`**
  * *Description:* Fetches configuration detail of a link by UUID primary key (owner only).
* **`urlByCode(shortCode: String!): ShortURLType!`**
  * *Description:* Public information check of a short code (does not trigger redirection click tracking).
* **`expiredUrls: [ShortURLType!]!`**
  * *Description:* Lists expired links.
* **`favoriteUrls: [ShortURLType!]!`**
  * *Description:* Lists favorited/starred links.
* **`analytics(urlId: UUID!, days: Int): AnalyticsType!`**
  * *Description:* Returns analytics split (daily clicks, browsers, devices, countries, referer origins) for a specific link.
* **`dashboardStats / dashboard: DashboardType!`**
  * *Description:* Aggregate metrics summaries for the user's links dashboard.

#### **Mutations (Write Operations)**

* **`createShortUrl(input: CreateShortURLInput!): ShortURLType!`**
  * *Input Arguments:* `originalUrl`, `title` (optional), `customAlias` (optional), `expiresAt` (optional).
  * *Description:* Creates short links / alias mappings.
* **`updateShortUrl(id: UUID!, input: UpdateShortURLInput!): ShortURLType!`**
  * *Input Arguments:* `customAlias`, `expiresAt`, `isActive`, `title`.
  * *Description:* Edits properties of an existing short URL and invalidates redirect cache.
* **`deleteShortUrl(id: UUID!): ShortURLType!`**
  * *Description:* Soft-deletes a URL, removing redirection routes.
* **`restoreShortUrl(id: UUID!): ShortURLType!`**
  * *Description:* Restores a soft-deleted URL.
* **`toggleFavorite(id: UUID!): ShortURLType!`**
  * *Description:* Stars/unstars a URL item.
* **`generateQrCode(id: UUID!): String!`**
  * *Description:* Returns a base64 encoded PNG QR code representing the short URL destination.

---

### 2. REST API Endpoints

* **`GET /{short_code}`**
  * *Description:* Decodes and forwards short codes to original URLs using: Rate limit checking -> Redis cache resolution check -> DB check fallback -> click analytics tracking -> `301 Moved Permanently`.
* **`GET /health`**
  * *Description:* Standard system health probe check.
* **`POST /api/webhooks/clerk`**
  * *Description:* Handles Clerk webhooks for synchronization of Clerk users to local DB profiles.

---

## Environment Configuration

### Backend Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and update the values:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis server connection endpoint | `redis://localhost:6379` |
| `CLERK_SECRET_KEY` | Clerk Private Backend Secret Key | `sk_test_xxxxxx` |
| `CLERK_PUBLISHABLE_KEY` | Clerk Public Frontend Key | `pk_test_xxxxxx` |
| `CLERK_WEBHOOK_SECRET` | Clerk Webhook secret for sync syncs | `whsec_xxxxxx` |
| `APP_ENV` | Running Environment | `development` or `production` |
| `SHORT_URL_BASE`| Base domain name used for short aliases | `http://localhost:8000` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173` |

### Frontend Environment Variables (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local` and update the values:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Public Publishable Key | `pk_test_xxxxxx` |
| `VITE_GRAPHQL_URL` | Main GraphQL server endpoint | `http://localhost:8000/graphql` |
| `VITE_API_URL` | REST endpoints base URL | `http://localhost:8000` |
| `VITE_SHORT_URL_BASE` | Base URL used to display shortened links | `http://localhost:8000` |

---

## Getting Started

### Backend Setup

1. **Navigate to backend workspace:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Prepare environment database migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Start FastAPI development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### Frontend Setup

1. **Navigate to frontend workspace:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Run local developer server:**
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:5173` by default.