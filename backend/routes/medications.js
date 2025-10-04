//Ths is to enable uers
//Add medications, View their medication list, Update Dosages, 
//Remove medications they have stopped taking.
//This is basically forming the foundation for conflict checking

const express = require('express');
const Medication = require('../models/Medications');
const UserMedication = require('../models/UserMedication');
const { authenticate, validateRequest } = require('../middleware/auth');
const router = express.Router();

//all routes in this file require authentication because
//only logged in users should manage medications
router.use(authenticate);

//Route to Search medications by name
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query; // Get search term from URL parameter

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search term must be at least 2 characters'
            });
        }

        // Use our custom search method from the model
        const medications = await Medication.searchByName(q);

        res.json({
            success: true,
            count: medications.length,
            medications: medications.map(med => ({
                _id: med._id,
                genericName: med.genericName,
                brandNames: med.brandNames,
                drugClass: med.drugClass,
                therapeuticArea: med.therapeuticArea
            }))
        });

    } catch (error) {
        console.error('Medication search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching medications'
        });
    }
});


router.post('/medications', authenticate, async (req, res) => {
    try {
        console.log('Add medication to database:', req.body);

        const medication = new Medication(req.body);
        await medication.save();

        res.status(201).json({
            success: true,
            message: 'Medication added successfully',
            data: medication
        });
    } catch (error) {
        console.error('Add medication error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add medication'
        });
    }
});

// GET - Get all medications from master database
router.get('/medications', authenticate, async (req, res) => {
    try {
        const medications = await Medication.find({ isActive: true });

        res.json({
            success: true,
            data: medications
        });
    } catch (error) {
        console.error('Get medications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch medications'
        });
    }
});



//route to add medication to user's list
router.post('/user-medications',
    validateRequest(['medicationId', 'dosage', 'frequency']),
    async (req, res) => {
        try {
            const { medicationId, dosage, frequency, prescribedBy, startDate, notes } = req.body;

            //To check if medication exists in the database
            const medication = await Medication.findById(medicationId);
            if (!medication) {
                return res.status(404).json({
                    success: false,
                    message: 'Medication not found'
                });
            }
            //This is checking if the user already has this medication to prevent duplicates
            const existingUserMed = await UserMedication.findOne({
                userId: req.userId,
                medicationId: medicationId,
                isActive: true
            });

            if (existingUserMed) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already taking this medication.'
                });
            }

            //Create new user medication record
            const userMedication = new UserMedication({
                userId: req.userId,
                medicationId,
                dosage,
                frequency,
                prescribedBy,
                startDate: startDate ? new Date(startDate) : new Date(),
                notes
            });

            // save the medication
            await userMedication.save();

            //send success response
            res.status(201).json({
                success: true,
                message: 'Medication added successfully',
                userMedication: {
                    id: userMedication._id,
                    medicationId: userMedication.medicationId,
                    dosage: userMedication.dosage,
                    frequency: userMedication.frequency,
                    startDate: userMedication.startDate
                }
            });

        } catch (error) {
            console.error('Not able to add medication:', error);
            res.status(403).json({
                success: false,
                message: 'Error adding medications'
            })
        }
    });

module.exports = router;




