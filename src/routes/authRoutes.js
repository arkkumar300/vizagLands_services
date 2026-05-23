import express from 'express';
import { registerClient, loginClient, loginAdmin, registerAdmin, loginWithPhone, verifyPhoneLogin, resendOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/admin/register', registerAdmin);
router.post('/register', registerClient);
router.post('/login/client', loginClient);
router.post('/login/phone', loginWithPhone);
router.post('/login/phone/verify', verifyPhoneLogin);
router.post('/resend-otp', resendOTP);
router.post('/login/admin', loginAdmin);

export default router;