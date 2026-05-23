import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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
// import favoritesRoutes from './routes/FavoriteRoute.js';
// import projectsRoutes from './routes/projectRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
// app.use('/api/favorites', favoritesRoutes);
// app.use('/api/projects', projectsRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Vizag Lands API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      properties: '/api/properties',
      leads: '/api/leads',
      clients: '/api/clients',
      blogs: '/api/blogs',
      dashboard: '/api/dashboard',
      images: '/api/images'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const startServer = async () => {
  try {
    await models.sequelize.authenticate();
    console.log('Database connection established successfully.');

    await models.sequelize.sync({ alter: false });
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
