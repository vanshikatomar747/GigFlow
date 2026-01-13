const User = require('../models/User');

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure user can only delete their own account (unless admin, but we don't have admin role yet)
        if (req.user._id.toString() !== user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this account' });
        }

        // Use deleteOne to trigger the middleware
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: req.headers.authorization ? req.headers.authorization.split(' ')[1] : req.cookies.jwt,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ message: error.message || 'Server error' });
        }
    }
};

module.exports = {
    deleteUser,
    updateUserProfile
};
