import express from 'express';
import {
  getMainDashboard,
  getClientDashboard,
  getClientLeadsPage,
  getAdminDashboard
} from '../controllers/dashboardController.js';
import { authenticateAdmin, authenticateClient } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMainDashboard);
router.get('/client', authenticateClient, getClientDashboard);
router.get('/admin', authenticateAdmin, getAdminDashboard);
router.get('/client/leads', authenticateClient, getClientLeadsPage);

export default router;
