const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // Always true for cross-site (Vercel -> Render)
        sameSite: 'none', // Allow cross-site cookie
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'client',
            otp,
            otpExpires,
            isVerified: false // Default to false
        });

        if (user) {
            const message = `
                <h1>Email Verification</h1>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code expires in 10 minutes.</p>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'GigFlow - Email Verification',
                    message,
                });

                res.status(200).json({
                    message: 'Verification Code Sent',
                    email: user.email,
                    _id: user._id
                });
            } catch (error) {
                console.error('Email send failed:', error);

                res.status(200).json({
                    message: 'Verification Code Sent (Check Console in Dev)',
                    email: user.email,
                    _id: user._id
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        const logMsg = `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\n\n`;
        try {
            fs.appendFileSync(path.join(__dirname, '../debug_error.log'), logMsg);
        } catch (filesysErr) {
            console.error('Failed to write log:', filesysErr);
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Optional: Check if verified. 
            // For now, let's enforce it for new users. 
            // Existing users might not have isVerified set, so we check if it is explicitly false.
            if (user.isVerified === false) {
                return res.status(401).json({ message: 'Please verify your email first' });
            }

            generateToken(res, user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    };
    res.status(200).json(user);
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    verifyOtp,
};
