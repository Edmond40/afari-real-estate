# Afari Real Estate - Deployment Guide

This guide provides step-by-step instructions for deploying the Afari Real Estate application.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Vercel account (for frontend)
- Render account (for backend)
- Neon PostgreSQL database
- GitHub account (recommended for deployment)

## 1. Frontend Deployment (Vercel)

### 1.1 Prepare the Frontend

1. Ensure all environment variables are set in `.env.production`
2. Update `VITE_API_BASE_URL` in `.env.production` to point to your backend URL
3. Commit your changes to Git

### 1.2 Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Vite
   - Root Directory: (leave empty)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables from `.env.production`
6. Click "Deploy"

## 2. Backend Deployment (Render)

### 2.1 Prepare the Backend

1. Navigate to the `server` directory
2. Create a `.env` file with your database connection string and other environment variables
3. Install dependencies: `npm install`
4. Run database migrations: `npx prisma migrate deploy`
5. Commit your changes to Git

### 2.2 Deploy to Render

1. Go to [Render](https://render.com) and sign up/sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `afari-backend` (or your preferred name)
   - Region: Choose the closest to your users
   - Branch: `main` (or your deployment branch)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=your_neon_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `PORT=10000`
6. Click "Create Web Service"

## 3. Database Configuration (Neon)

1. Log in to your [Neon](https://neon.tech) account
2. Create a new project if you haven't already
3. Get your database connection string from the Neon dashboard
4. Update the `DATABASE_URL` in your backend environment variables
5. Run database migrations after deployment

## 4. Environment Variables

### Frontend (`.env.production`)
```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
VITE_AUTH_TOKEN_KEY=afari_auth_token
VITE_REFRESH_TOKEN_KEY=afari_refresh_token
NODE_ENV=production
```

### Backend (`.env` in server directory)
```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
PORT=10000
# Add any other required environment variables
```

## 5. Post-Deployment

1. Test all API endpoints
2. Verify frontend-backend communication
3. Set up custom domains if needed
4. Configure SSL certificates (usually handled automatically by Vercel/Render)

## Troubleshooting

- **Frontend not connecting to backend**: Verify `VITE_API_BASE_URL` is correct
- **Database connection issues**: Check your Neon database connection string and firewall settings
- **CORS errors**: Ensure CORS is properly configured in your backend
- **Environment variables**: Verify all required variables are set in both Vercel and Render dashboards
