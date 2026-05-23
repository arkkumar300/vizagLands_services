// routes/propertyViewRoutes.js
import express from 'express';
import {
  recordPropertyView,
  getRecentPropertyViews,
  getUserPropertyViews
} from '../controllers/propertyViewController.js';
import { authenticateClient } from '../middleware/auth.js';

const router = express.Router();

router.post('/',authenticateClient, recordPropertyView);
router.get('/recent', getRecentPropertyViews);
router.get('/user',authenticateClient, getUserPropertyViews);

export default router;
