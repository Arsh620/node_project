const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const { logout } = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);

router.post('/logout', authenticate, logout);


module.exports = router;
