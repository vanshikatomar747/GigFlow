const Gig = require('../models/Gig');

// @desc    Fetch all open gigs (with search query)
// @route   GET /api/gigs
// @access  Public
const getGigs = async (req, res) => {
    const keyword = req.query.search
        ? {
            title: {
                $regex: req.query.search,
                $options: 'i',
            },
        }
        : {};

    const query = { ...keyword, status: 'Open' };

    const gigs = await Gig.find(query)
        .populate('ownerId', 'name email')
        .populate('bidCount')
        .sort({ createdAt: -1 });

    res.json(gigs);
};

// @desc    Create a new job post
// @route   POST /api/gigs
// @access  Private
const createGig = async (req, res) => {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const gig = await Gig.create({
        ownerId: req.user._id,
        title,
        description,
        budget,
    });

    res.status(201).json(gig);
};

// @desc    Get gig by ID
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = async (req, res) => {
    const gig = await Gig.findById(req.params.id)
        .populate('ownerId', 'name email')
        .populate('bidCount');

    if (gig) {
        res.json(gig);
    } else {
        res.status(404);
        throw new Error('Gig not found');
    }
};

// @desc    Get all gigs posted by authenticated user
// @route   GET /api/gigs/my-gigs
// @access  Private
const getUserGigs = async (req, res) => {
    const gigs = await Gig.find({ ownerId: req.user._id })
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 });

    res.json(gigs);
};

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private
const deleteGig = async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    // Check if user is the owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this gig');
    }

    // Check if gig is already assigned
    if (gig.status === 'Assigned') {
        res.status(400);
        throw new Error('Cannot delete an assigned gig');
    }

    await Gig.deleteOne({ _id: req.params.id });
    res.json({ message: 'Gig deleted successfully' });
};

// @desc    Update gig status
// @route   PATCH /api/gigs/:id/status
// @access  Private
const updateGigStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['Open', 'Closed'].includes(status)) {
            res.status(400);
            throw new Error('Invalid status. Must be Open or Closed');
        }

        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            res.status(404);
            throw new Error('Gig not found');
        }

        // Check if user is the owner
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this gig');
        }

        gig.status = status;
        const updatedGig = await gig.save();

        res.json(updatedGig);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = {
    getGigs,
    createGig,
    getGigById,
    getUserGigs,
    deleteGig,
    updateGigStatus,
};
