const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            enum: ['client', 'freelancer'],
            default: 'client',
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
        },
        otpExpires: {
            type: Date,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Cascade delete gigs when a user is deleted
userSchema.pre('deleteOne', { document: true, query: true }, async function (next) {
    const Gig = require('./Gig');
    const Bid = require('./Bid');
    const userId = this.getQuery()['_id'];

    // Delete all gigs posted by this user
    await Gig.deleteMany({ ownerId: userId });

    // Delete all bids placed by this user
    await Bid.deleteMany({ freelancerId: userId });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
