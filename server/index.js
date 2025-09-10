import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { prisma } from './src/lib/prisma.js';

// Verify environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Routes
import listingsRoute from './src/routes/listings.js';
import authRoute from './src/routes/auth.js';
import usersRoute from './src/routes/users.js';
import reviewsRoute from './src/routes/reviews.js';
import agentsRoute from './src/routes/agents.js';
import inquiriesRoute from './src/routes/inquiries.js';
import userInteractionsRoute from './src/routes/userInteractions.js';
import dashboardRoute from './src/routes/dashboard.js';
import appointmentsRoute from './src/routes/appointments.js';
import notificationsRoute from './src/routes/notifications.js';
import { errorHandler, notFound } from './src/middleware/error.js';

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
// CORS configuration: allow configured origins, Vercel previews, and localhost
const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : []).concat(['http://localhost:3000', 'http://localhost:5137']);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isExplicit = allowedOrigins.includes(origin);
    const isVercel = /\.vercel\.app$/.test(new URL(origin).hostname);
    if (isExplicit || isVercel) return callback(null, true);
    return callback(new Error('CORS not allowed for origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

// Ensure preflight requests are handled
app.options('*', cors());
app.use(morgan('dev')); 

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      time: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/listings', listingsRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/agents', agentsRoute);
app.use('/api/inquiries', inquiriesRoute);
app.use('/api/user-interactions', userInteractionsRoute);
app.use('/api/dashboard', dashboardRoute);
// Unified appointments route that handles both user and admin functionality
app.use('/api/appointments', appointmentsRoute);
app.use('/api/notifications', notificationsRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
          app.listen(PORT + 1, () => {
            console.log(`Server running on port ${PORT + 1}`);
          });
        } else {
          console.error('Server error:', err);
        }
      });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
