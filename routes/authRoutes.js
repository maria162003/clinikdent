const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/recuperar', authController.recuperarPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-token/:token', authController.verifyResetToken);

module.exports = router;
