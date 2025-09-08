const mongoose = require('mongoose');
//Medications that exist in the database
//Schema/blueprint for individual medications/drugs
const medicationSchema = new mongoose.Schema({
    //Basic drug identification
    genericName: {
        type: String,
        required: [true, 'Generic name is required'],
        unique: true,
        trim: true,
        lowercase: true
    },

    brandNames: [{
        type: String,
        trim: true
    }], //It is an array because one drug can have multiple brand names

    //Active ingredients(very important for interaction checking)
    activeIngredients: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        strength: String, // eg 200mg, 50ml
        unit: String // mg, ml, units, g
    }],

    //Classifying drugs to help group similar medications
    drugClass: {
        type: String,
        required: true,
        enum: [
            'analgesic', 'antibiotic', 'antidepressant', 'antihistamine',
            'antihypertensive', 'anticoagulant', 'diabetes_medication',
            'heart_medication', 'psychiatric_medication', 'hormone',
            'vitamin', 'supplement', 'other'
        ]
    },

    subClass: String, //More specific classification

    // Medical information
    therapeuticArea: {
        type: String,
        required: true
    }, // What condition does the medication

    routeOfAdministration: {
        type: String,
        enum: ['oral', 'injection', 'topical', 'inhalation', 'other'],
        default: 'oral'
    },

    // Dosage information
    commonDosages: [{
        strength: String,
        frequency: String, // e.g twice daily, once daily, as needed
        indication: String // what condition this dosage treats
    }],

    // Safety information
    contraindications: [String], // When not to use this drug
    sideEffects: [{
        effect: String,
        frequency: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'very_rare']
        }
    }],

    // Special populations
    pregnancyCategory: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'X', 'unknown']
    },


    pediatricUse: Boolean,
    geriatricConsiderations: String,

    // Drug interaction data
    majorInteractions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication' // References other medications
    }],

    moderateInteractions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication'
    }],

    minorInteractions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication'
    }],

    // Food and lifestyle interactions
    foodInteractions: [String], // e.g avoid acidic foods
    lifestyleWarnings: [String], // e.g do not drink alcohol 

    // Regulatory and approval info
    fdaApproved: {
        type: Boolean,
        default: true
    },

    mhraApproved: {
        type: Boolean,
        default: true
    },

    approvalDate: Date,

    // Prescription requirements
    prescriptionRequired: {
        type: Boolean,
        default: true
    },

    controlledSubstance: {
        schedule: {
            type: String,
            enum: ['I', 'II', 'III', 'IV', 'V', 'none'],
            default: 'none'
        }
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

//indexes for fast searching, when users start typing a medication, it quickly comes up
medicationSchema.index({ genericName: 'text', brandNames: 'text' });
medicationSchema.index({ drugClass: 1 });
medicationSchema.index({ activeIngredients: 1 }); //1 means sort in ascending order
// If we do not use index, MongoDB will have to scan every document to answer a query, which is very slow

// Middleware to Update timestamp before saving
medicationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

//This is a static method, it allows the app to medications by name, brand or ingredient.
medicationSchema.statics.searchByName = async function (searchTerm) {
    const regex = new RegExp(searchTerm, 'i'); //creates a regular expression from the search item, it is not case sensitive

    return await this.fing({
        $or: [
            { genericName: regex },
            { brandNames: { $in: [regex] } },
            { 'activeIngredients.name': regex }
        ],
        isActive: true
    }).limit(20); //the results are limited for performance
};

//method that gets all the possible interactions for this medication.
medicationSchema.methods.getAllInteractions = function () {
    return {
        major: this.majorInteractions,
        moderate: this.moderateInteractions,
        minor: this.minorInteractions,
        food: this.foodInteractions,
        lifestyle: this.lifestyleWarnings
    };
};

module.exports= mongoose.model('Medication', medicationSchema);
