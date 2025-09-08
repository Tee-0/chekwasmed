const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

//ROUTE: Register new user

router.post('/register', async (req, res) => {
    try {
        console.log("Received registration request:", req.body);

        const { name, email, password, dateOfBirth } = req.body;

        //checking if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        //Create New User
        const user = new User({
            name, email, password, dateOfBirth: new Date(dateOfBirth)
        });

        await user.save();

        //Generate token immediately after registeration for better user experience
        const token = user.generateAuthToken();

        //Return success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});
// ROUTE: Login existing user
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password field it is normally excluded
        // Why use +password? It is cuz our schema has 'select: false' on password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Compare provided password with stored hash
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate new token for this login session
        const token = user.generateAuthToken();

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

//ROUTE: get current user profile, it requires authentication, user must provide valid token
router.get('/me', async (req, res) => {
    try {
        //extract token from Authorization header
        const token = req.header('Authorization')?.replace('Bearer', '').trim();
        console.log('Extracted token:', token);


        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

        // Find user (exclude password)
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                role: user.role,
                allergies: user.allergies,
                medicalConditions: user.medicalConditions
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });

    }
});

//Route to update user profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(tokem, process.env.JWT_SECRET || 'fallback-secret-key');
        const userId = decoded.userId;

        //gets fields that can be updated
        const { name, allergies, medicalConditions } = req.body;

        //Update user, not allowing email or password changes for security
        const user = await User.findByIdAndUpdate(   //await: to wait for database to respond as it takes time sometimes
            userId,
            {
                name, allergies, medicalConditions, updatedAt: Date.now()
            },
            { new: true, runValidators: true } //Returns Updates document because mongoose returns old documents by default and also run schema validations
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                allergies: user.allergies,
                medicalConditions: user.medicalConditions
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
});

module.exports = router; //exports the router so that other files can use it, making route file available to the rest of the node.js app