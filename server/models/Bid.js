const mongoose = require('mongoose');

const bidSchema = mongoose.Schema(
    {
        gigId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Gig',
        },
        freelancerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        message: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Hired', 'Rejected'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
