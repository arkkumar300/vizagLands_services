import express from 'express';
import {
  uploadImage,
  uploadMultipleImages,
  uploadDocument,
  deleteImage,
  uploadVideos
} from '../controllers/imageController.js';
import { upload, uploadVideo } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', authenticate, upload.single('image'), uploadImage);
router.post('/uploadVideo', authenticate, uploadVideo.single('video'), uploadVideos);
router.post('/upload-multiple', authenticate, upload.array('images', 10), uploadMultipleImages);
router.post('/upload-document', authenticate, upload.single('document'), uploadDocument);
router.delete('/delete', authenticate, deleteImage);

export default router;
