//This file is to track how the user takes their medications
//Bridge between medications that exist and medication user takes
const mongoose = require('mongoose');

//Schema/blueprint to track which medications each user is taking

const userMedicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    //Link to the actual medication from our drug database
    medicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true
    },

    //Medication Details 
    dosage: {
        amount: {
            type: Number,
            required: [true, 'Dosage amount is required']
        },
        unit: {
            type: String,
            required: [true, 'Dosage unit is required'],
            enum: ['mg', 'g', 'ml', 'tablets', 'capsules', 'units', 'drops']
        }
    },

    frequency: {
        timesPerDay: {
            type: Number,
            required: true,
            min: [1, 'Medication must be taken once a day'],
            max: [24, 'Cannot exceed 24 times per day']
        },
        schedule: [String], // time and how often(e.g twice daily)
        asNeeded: {
            type: Boolean,
            default: false
        }
    },

    //Medical Context for drugs
    prescribedBy: {
        doctorName: String,
        specialty: String,
        contactInfo: String
    },

    //reason for taking drug
    indication: {
        type: String,
        required: [true, 'Medical reason for taking this medication is required']
    },

    //Tracking the timeline of the drug
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    endDate: Date, //when they stopped taking it

    // Patient compliance tracking
    adherenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100 // Assume perfect adherence initially
    },

    missedDoses: [{
        date: Date,
        reason: String
    }],

    // Side effects experienced by THIS user
    experiencedSideEffects: [{
        effect: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        },
        startDate: Date,
        resolved: Boolean
    }],

    // User notes and observations
    notes: String,
    patientReported: {
        effectiveness: {
            type: Number,
            min: 1,
            max: 10
        }, // How well does this work for user on a scale of 1-10
        tolerability: {
            type: Number,
            min: 1,
            max: 10
        } // How well does user tolerate medication on a scale of 1-10
    },

    // System fields
    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

//Compund index'table of contents'(Index that has more than one field)
//Compund index ensures one user cannot have duplicate active medication
//to prevent accidentally adding the same drug twice
userMedicationSchema.index(
    { userId: 1, medicationId: 1, isActive: 1 },
    {
        unique: true, //you can't insert two documwnts with the same combination of these fields
        partialFilterExpression: { isActive: true } // only apply unnique method when Medication is active
    }
);

//INDEX for fast queries
userMedicationSchema.index({ userId: 1, isActive: 1 }); //user active med
userMedicationSchema.index({ userId: 1, createdAt: -1 }); //last added or most recent medication

//Middleware(hooks) lets us run code automatically at certain points in a doc's lifecycle
//Middleware for automatically updating timestamps before saving

userMedicationSchema.pre('save', function (next) {
    this.updatedAt = Date.now(); //This ensures I always know when this document was last changed
    next();
});

//A virtual field is a field that’s not saved in the database but is calculated dynamically whenever you request it.
//This virtual method calculates how long user has been on this medication
userMedicationSchema.virtual('durationDays').get(function () {
    const endDate = this.endDate || new Date(); //If end date exists, use it, if not, used present date
    const diffTime = Math.abs(endDate - this.startDate); // diff between end date and start date
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); //conv from milliseconds to days
});