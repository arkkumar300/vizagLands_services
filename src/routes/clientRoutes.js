import express from 'express';
import {
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  updatePassword,
  getClientByRole,
  getAdminById,updateClientStatus,
  updateAdminPassword,
  updateAdmin
} from '../controllers/clientController.js';
import { authenticate, authenticateAdmin, authenticateClient } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateAdmin, getAllClients);
router.get('/getClientByRole/:role', authenticateAdmin, getClientByRole);
router.get('/getClient/:id', authenticateClient, getClientById);
router.get('/getAdmin/:id', authenticateAdmin, getAdminById);
router.put('/:id', authenticate, updateClient);
router.put('/admin/:id', authenticateAdmin, updateAdmin);
router.put('/:id/update-password', authenticateClient, updatePassword);
router.put('/admin/:id/update-password', authenticateAdmin, updateAdminPassword);
router.put('/admin/:id/update-status', authenticateAdmin, updateClientStatus);
router.delete('/:id', authenticateAdmin, deleteClient);

export default router;
