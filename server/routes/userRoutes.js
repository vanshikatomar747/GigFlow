const express = require('express');
const router = express.Router();
const { deleteUser, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.delete('/:id', protect, deleteUser);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
