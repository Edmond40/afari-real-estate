# Render Deployment Guide for Afaris Real Estate Backend

## Prerequisites
1. Render account (free tier available)
2. Neon database (already set up)
3. Vercel frontend deployment (already set up)

## Step 1: Prepare Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=your-neon-database-url
DIRECT_URL=your-neon-direct-url

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Server Configuration
PORT=10000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## Step 2: Deploy to Render

1. **Connect Repository**: Connect your GitHub repository to Render
2. **Create Web Service**: 
   - Choose "Web Service"
   - Select your repository
   - Set the following:
     - **Name**: `afaris-real-estate-api`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Environment Variables**: Add the following environment variables in Render dashboard:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your Neon database URL
   - `DIRECT_URL`: Your Neon direct URL
   - `JWT_SECRET`: Generate a secure random string
   - `CORS_ORIGIN`: Your Vercel frontend URL
   - `PORT`: `10000`

## Step 3: Update Frontend Configuration

Update your frontend's environment variables in Vercel:
- `VITE_API_BASE_URL`: `https://your-render-app-name.onrender.com/api`

## Step 4: Database Setup

The deployment will automatically:
1. Generate Prisma client
2. Push database schema to Neon
3. Create all necessary tables

## Step 5: Test Deployment

1. Check Render logs for successful startup
2. Test API endpoints: `https://your-render-app-name.onrender.com/api/health`
3. Verify frontend can connect to backend

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check that all dependencies are in `package.json`
2. **Database Connection**: Verify `DATABASE_URL` and `DIRECT_URL` are correct
3. **CORS Issues**: Ensure `CORS_ORIGIN` matches your frontend domain
4. **Port Issues**: Render uses port 10000 by default

### Logs:
- Check Render service logs for detailed error messages
- Use `console.log` statements for debugging (remove in production)

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] CORS configured for frontend domain
- [ ] JWT secret is secure and random
- [ ] Frontend API URL updated
- [ ] Health endpoint responding
- [ ] All API endpoints tested

