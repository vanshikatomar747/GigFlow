const mongoose = require('mongoose');

const gigSchema = mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Open', 'Assigned', 'Closed'],
            default: 'Open',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Add index for search
gigSchema.index({ title: 'text' });

// Virtual for bid count
gigSchema.virtual('bidCount', {
    ref: 'Bid',
    localField: '_id',
    foreignField: 'gigId',
    count: true,
});

const Gig = mongoose.model('Gig', gigSchema);

module.exports = Gig;
