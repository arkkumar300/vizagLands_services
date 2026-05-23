import express from 'express';
import { addFavorite, removeFavorite, getClientFavorites } from '../controllers/favoriteController.js';

const router = express.Router();

router.post('/favorites', addFavorite); // add
router.delete('/favorites', removeFavorite); // remove
router.get('/favorites/:clientId', getClientFavorites); // list all

export default router;
