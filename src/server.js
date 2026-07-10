import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

import models from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import commercialAdsRoutes from './routes/commercialAdsRoutes.js';
import propertyViewRoutes from './routes/propertyViewRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   Security Middleware
========================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
      error: 'Too many requests. Please try again later.'
    }
  })
);

app.use(morgan('combined'));

/* =========================
   CORS Configuration
========================= */

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://vmrdaplots.com',
  'https://vmrdaplots.com',
  'http://admin.vmrdaplots.com',
  'https://admin.vmrdaplots.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    console.log(`CORS Request From: ${origin}`);

    if (
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* =========================
   Body Parsers
========================= */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   Static Files
========================= */

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

/* =========================
   API Routes
========================= */

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/city', cityRoutes);
app.use('/api/propertyView', propertyViewRoutes);
app.use('/api/commercialAds', commercialAdsRoutes);

/* =========================
   Health Check
========================= */

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vizag Lands API Server',
    version: '1.0.0'
  });
});

/* =========================
   404 Handler
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

/* =========================
   Global Error Handler
========================= */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message
  });
});

/* =========================
   Server Startup
========================= */

const startServer = async () => {
  try {
    await models.sequelize.authenticate();
    console.log('✅ Database connected');

    if (process.env.NODE_ENV !== 'production') {
      await models.sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();