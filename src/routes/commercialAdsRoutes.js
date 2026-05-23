// routes/commercialAdsRoutes.js
import express from 'express';
import {
  createCommercialAd,
  getAllCommercialAds,
  getCommercialAdById,
  updateCommercialAd,
  deleteCommercialAd,
  updateCommercialAdStatus,
  getCommercialAdsByStatus
} from '../controllers/commercialAdsController.js';

const router = express.Router();

// CREATE
router.post('/', createCommercialAd);

// READ
router.get('/', getAllCommercialAds);
router.get('/getActiveCommercialAds', getCommercialAdsByStatus);
router.get('/:id', getCommercialAdById);

// UPDATE
router.put('/:id', updateCommercialAd);

// DELETE
router.delete('/:id', deleteCommercialAd);

// UPDATE STATUS only
router.put('/:id/status', updateCommercialAdStatus);

export default router;
