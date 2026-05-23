// routes/cityRoutes.js
import express from 'express';
import { addOrUpdateCity, deleteCities, getAllCities, updateAllCities } from '../controllers/cityController.js';

const router = express.Router();

router.post('/', addOrUpdateCity);
router.get('/', getAllCities);
router.put('/', updateAllCities);
router.delete('/:id', deleteCities);

export default router;
