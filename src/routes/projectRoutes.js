import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMostViewedProjects,
  searchProjects,
  updateProjectViewCount,
  createAdminProject
} from '../controllers/projectController.js';
import { authenticate, authenticateClient } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createProject);
router.post('/admin-project', authenticate, createAdminProject);
router.get('/', getAllProjects);
router.get('/most-viewed', getMostViewedProjects);
router.get('/searchProject', searchProjects);
router.get('/:id', getProjectById);
router.put('/:id', authenticate, updateProject);
router.put('/updateView/:id', updateProjectViewCount);
router.put('/updateRenewal/:id', updateProjectViewCount);
router.delete('/:id', authenticate, deleteProject);

export default router;
