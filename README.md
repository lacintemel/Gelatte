# GELATTE — Gelato | Coffee | Bakery

Premium e-commerce store for a boutique patisserie in Antalya, Turkey.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Express 5, Node.js |
| Database | PostgreSQL, Prisma ORM |
| Payment | PayTR (iframe hosted payment) |
| Auth | JWT + bcrypt |
| Validation | Zod |

## Project Structure

```
Gelatte/
├── src/               # React frontend
│   ├── components/    # UI components
│   ├── context/       # React context providers
│   ├── data/          # Static data & translations
│   ├── hooks/         # Custom hooks
│   ├── layouts/       # Layout components
│   ├── lib/           # API client
│   └── pages/         # Page components
├── server/            # Express backend
│   ├── prisma/        # Schema & migrations
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/    # Env & DB config
│   │   ├── middleware/ # Auth, admin, validation, rate limiting
│   │   ├── routes/    # API route handlers
│   │   ├── services/  # Payment provider integration
│   │   └── utils/     # Crypto, logging, idempotency
│   └── index.js       # Server entry point
└── public/            # Static assets
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- PayTR merchant account (for production payments)

## Getting Started

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Set Up Database

```bash
# Create a PostgreSQL database named 'gelatte'
createdb gelatte

# Configure your database URL in server/.env
cd server
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string

# Run migrations
npx prisma migrate dev --name init

# Seed development data
npm run db:seed
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend (port 3001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
npm run dev
```

The Vite dev server proxies `/api` requests to the Express backend automatically.

### 4. Open the App

Visit [http://localhost:5173](http://localhost:5173)

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@example.com | [REDACTED] |
| Staff | staff@example.com | [REDACTED] |
| Customer | demo@example.com | [REDACTED] |

## Environment Variables

See [server/.env.example](server/.env.example) for all required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PAYTR_MERCHANT_ID` | PayTR merchant ID |
| `PAYTR_MERCHANT_KEY` | PayTR merchant key |
| `PAYTR_MERCHANT_SALT` | PayTR merchant salt |
| `PAYTR_TEST_MODE` | `1` for sandbox, `0` for production |
| `APP_URL` | Frontend URL (e.g., `http://localhost:5173`) |
| `API_URL` | Backend URL (e.g., `http://localhost:3001`) |
| `PAYTR_CALLBACK_URL` | PayTR callback URL (must be publicly accessible) |

## Payment Testing (PayTR Sandbox)

1. Set `PAYTR_TEST_MODE=1` in `server/.env`
2. Enter your PayTR sandbox credentials
3. Use PayTR test card numbers from your merchant panel documentation
4. The payment callback requires a publicly accessible URL — use a tunneling service (e.g., ngrok) for local testing:
   ```bash
   ngrok http 3001
   # Update PAYTR_CALLBACK_URL in .env with the ngrok URL
   ```

## API Endpoints

### Public
- `GET /api/products` — List products
- `GET /api/products/:id` — Product detail
- `GET /api/categories` — List categories
- `POST /api/auth/register` — Register customer
- `POST /api/auth/login` — Login
- `POST /api/coupons/validate` — Validate coupon

### Authenticated
- `GET /api/auth/me` — Current user profile
- `GET /api/cart` — Get cart
- `POST /api/cart/items` — Add to cart
- `POST /api/checkout` — Create order & init payment
- `GET /api/orders` — My orders

### Admin
- `GET /api/admin/dashboard` — Dashboard stats
- `GET /api/admin/orders` — All orders
- `PUT /api/admin/orders/:id/status` — Update order status

## Database Schema

16 models: User, Session, Address, ProductCategory, Product, ProductImage, ProductVariant, Cart, CartItem, Order, OrderItem, Payment, PaymentTransaction, Coupon, Review, StoreSetting, AuditLog

View the full schema: [server/prisma/schema.prisma](server/prisma/schema.prisma)

## Going to Production

1. Set up a production PostgreSQL database
2. Create a PayTR merchant account at [paytr.com](https://www.paytr.com)
3. Enter real credentials in production `.env`
4. Set `PAYTR_TEST_MODE=0`
5. Set `PAYTR_CALLBACK_URL` to your production HTTPS URL
6. Run `npx prisma migrate deploy`
7. Build the frontend: `npm run build`
