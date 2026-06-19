import express from 'express';
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMostViewedProperties,
  searchProperties,
  updatePropertyViewCount,
  createAdminProperty,
  getAllProject,
  searchProjects,
  getPropertyByslug
} from '../controllers/propertyController.js';
import { authenticate, authenticateClient } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createProperty);
router.post('/admin-property', authenticate, createAdminProperty);
router.get('/', getAllProperties);
router.get('/getAllProjects', getAllProject);
router.get('/most-viewed', getMostViewedProperties);
router.get('/searchProperty', searchProperties);
router.get('/searchProjects', searchProjects);
router.get('/:id', getPropertyById);
router.get('/:slug', getPropertyByslug);
router.put('/:id', authenticate, updateProperty);
router.put('/updateView/:id', updatePropertyViewCount);
router.put('/updateRenewal/:id', updatePropertyViewCount);
router.delete('/:id', authenticate, deleteProperty);

export default router;
