const express = require('express');
const router = express.Router();
const {
    getGigs,
    createGig,
    getGigById,
    getUserGigs,
    deleteGig,
    updateGigStatus
} = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getGigs)
    .post(protect, createGig);

router.route('/my-gigs').get(protect, getUserGigs);

router.route('/:id')
    .get(getGigById)
    .delete(protect, deleteGig);

router.route('/:id/status').patch(protect, updateGigStatus);

module.exports = router;
