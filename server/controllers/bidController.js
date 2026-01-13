const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const mongoose = require('mongoose');

// @desc    Submit a bid for a gig
// @route   POST /api/bids
// @access  Private
const createBid = async (req, res) => {
    const { gigId, message, price } = req.body;

    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.ownerId.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot bid on your own gig');
    }

    if (gig.status !== 'Open') {
        res.status(400);
        throw new Error('Gig is no longer open');
    }

    const bidExists = await Bid.findOne({ gigId, freelancerId: req.user._id });

    if (bidExists) {
        res.status(400);
        throw new Error('You have already placed a bid on this gig');
    }

    const bid = await Bid.create({
        gigId,
        freelancerId: req.user._id,
        message,
        price,
    });

    res.status(201).json(bid);
};

// @desc    Get all bids for a specific gig (Owner only)
// @route   GET /api/bids/:gigId
// @access  Private
const getBidsByGig = async (req, res) => {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    // Check if user is owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view bids for this gig');
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
        .populate('freelancerId', 'name email')
        .sort({ createdAt: -1 });

    res.json(bids);
};

// @desc    Hire a freelancer
// @route   PATCH /api/bids/:bidId/hire
// @access  Private
const hireFreelancer = async (req, res) => {
    const { bidId } = req.params;

    try {
        const bid = await Bid.findById(bidId);

        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        const gig = await Gig.findById(bid.gigId);

        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        if (gig.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to hire for this gig' });
        }

        if (gig.status !== 'Open') {
            return res.status(400).json({ message: 'Gig is already assigned' });
        }

        // 1. Update Gig status to Assigned
        gig.status = 'Assigned';
        await gig.save();

        // 2. Update status of the chosen bid to Hired
        bid.status = 'Hired';
        await bid.save();

        // 3. Reject all other bids for this gig
        await Bid.updateMany(
            { gigId: gig._id, _id: { $ne: bidId } },
            { status: 'Rejected' },
        );

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            // Notify the hired freelancer
            io.to(bid.freelancerId.toString()).emit('notification', {
                type: 'hired',
                message: `You have been hired for "${gig.title}"!`,
                gigId: gig._id,
            });
        }

        res.json({ message: 'Freelancer hired successfully', bid });
    } catch (error) {
        console.error('Hire freelancer error:', error);
        return res.status(500).json({ message: error.message || 'Hiring failed' });
    }
};

// @desc    Get logged in user's bids
// @route   GET /api/bids/my-bids
// @access  Private
const getMyBids = async (req, res) => {
    const bids = await Bid.find({ freelancerId: req.user._id })
        .populate({
            path: 'gigId',
            select: 'title description budget status ownerId createdAt',
            populate: {
                path: 'ownerId',
                select: 'name email'
            }
        })
        .sort({ createdAt: -1 });

    res.json(bids);
};

// @desc    Check if user has bid on a gig
// @route   GET /api/bids/check/:gigId
// @access  Private
const checkBidStatus = async (req, res) => {
    const bid = await Bid.findOne({ gigId: req.params.gigId, freelancerId: req.user._id });
    res.json(bid || null);
};

module.exports = {
    createBid,
    getBidsByGig,
    hireFreelancer,
    getMyBids,
    checkBidStatus,
};
