const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = await User.create({
            name,
            email,
            password,
            isVerified: false,
            verificationToken,
            verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        if (user) {
            const verificationUrl = `http://localhost:5173/verify-email/${verificationToken}`;
            const message = `Please verify your email by clicking the following link: \n\n ${verificationUrl}`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Email Verification',
                    message,
                });

                res.status(201).json({
                    message: 'Registration successful. Please check your email to verify your account.',
                });
            } catch (error) {
                user.verificationToken = undefined;
                user.verificationTokenExpire = undefined;
                await user.save({ validateBeforeSave: false });

                return next(new Error('Email could not be sent'));
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Email is not registered' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email to log in' });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('savedItems');

        if (user) {
            // Filter out any null items (deleted items) from savedItems
            const activeSavedItems = (user.savedItems || []).filter(item => item !== null);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                savedItems: activeSavedItems,
                orderHistory: user.orderHistory,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Verify email
// @route   GET /api/users/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
    try {
        const verificationToken = req.params.token;

        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    getUserProfile,
    updateUserProfile,
};
