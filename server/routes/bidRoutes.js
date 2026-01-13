const express = require('express');
const router = express.Router();
const {
    createBid,
    getBidsByGig,
    hireFreelancer,
    getMyBids,
    checkBidStatus
} = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBid);
router.get('/my-bids', protect, getMyBids);
router.get('/check/:gigId', protect, checkBidStatus);
router.get('/:gigId', protect, getBidsByGig);
router.patch('/:bidId/hire', protect, hireFreelancer);

module.exports = router;
