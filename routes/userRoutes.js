const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', userController.register);

// Apply Authentications
router.use(authenticate);

router.get('/get-user-by-id', userController.getAllUserById);
router.get('/get-user', userController.getAllUsers);
router.post('/update-user-by-id', userController.updateUserById);

module.exports = router;
