const express = require('express');
const router = express.Router();
const UserMedication = require('../models/UserMedication');
const Medication = require('../models/Medications');
const { authenticate, validateRequest } = require('../middleware/auth');

//All routes in this file require authentication
router.use(authenticate);

//GET: fetch all medications for the logged in user
router.get('/', async (req, res) => {
    try {
        const userMedications = await UserMedication.find({
            userId: req.userId,
            isActive: true
        }).populate('medicationId');

        res.json({
            success: true,
            medications: userMedications
        });

    } catch (error) {
        console.error('Error fetching user medications:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching medications'
        });
    }
});

// POST: Add a medication to the user's list
router.post(
    '/',
    validateRequest(['medicationId', 'dosage', 'frequency']),
    async (req, res) => {
        console.log('Incoming medication data:', req.body);

        try {
            const { medicationId, dosage, frequency } = req.body;

            // Check if medication exists in master database
            const medication = await Medication.findById(medicationId);
            if (!medication) {
                return res.status(404).json({
                    success: false,
                    message: 'Medication not found in database'
                });
            }

            // Check if user already has this medication
            const existingUserMed = await UserMedication.findOne({
                userId: req.userId,
                medicationId,
                isActive: true
            });

            if (existingUserMed) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already taking this medication'
                });
            }

            //  Create new UserMedication record
            const userMedication = new UserMedication({
                userId: req.userId,
                medicationId,
                dosage,
                frequency,
                startDate: new Date(), // default start date now
            });

            // Save to database
            await userMedication.save();

            //  Send response back to frontend
            res.status(201).json({
                success: true,
                message: 'Medication added successfully!',
                userMedication: {
                    id: userMedication._id,
                    medicationId: userMedication.medicationId,
                    dosage: userMedication.dosage,
                    frequency: userMedication.frequency,
                    startDate: userMedication.startDate
                }
            });

        } catch (error) {
            console.error('Error adding medication to user list:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while adding medication'
            });
        }
    }
);

module.exports = router;