# Afari Real Estate API (server)

## Setup
1. Create `.env` in `server/` (already scaffolded):
```
DATABASE_URL="mysql://afari_app:CHANGE_ME@localhost:3306/afari_real_estate_v2"
JWT_SECRET="change-this"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```
2. Install deps and init Prisma:
```
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Routes
- GET `/api/health`
- GET `/api/listings`
- POST `/api/listings` (Bearer token)
- DELETE `/api/listings/:id` (Bearer token)
