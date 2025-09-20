const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//User Definition
const userSchema = new mongoose.Schema({
    //User Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true, //removes extra spaces
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true, //removes extra spaces
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [5, 'Password must be at least 5 characters'],
        select: false //do not return password in queries by default

    },

    //healthcare specific fields
    //dateOfBirth: {
        //type: Date,
        //required: [true, 'Date of birth is required for drug interaction calculations']
    //},

    // get age() {
    //    if (!this.dateOfBirth) return null; // handle missing date
    //   const dob = this.dateOfBirth instanceof Date ?
    //   this.dateOfBirth : new Date(this.dateOfBirth);
    //   return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    //},

    //Medical Information
    allergies: [{
        type: String,
        trim: true
    }],

    medicalConditions: [{
        condition: String,
        diagnosedDate: Date,
        notes: String
    }],

    //System fields
    isActive: {
        type: Boolean,
        default: true
    },

    role: {
        type: String,
        enum: ['patient', 'doctor', 'pharmacist'],
        default: 'patient'
    },

    //tracking when records are created/updated
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },
});

//MIDDLEWARE(Runs before saving a user)

userSchema.pre('save', async function (next) {
    //only hash password if it has been modified
    if (!this.isModified('password')) return next();

    try {
        //hashing the password with bycrypt
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }

});

// METHOD: to compare provided password with stored hash
//in order to check passowrd at login without storing them in plain text
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        //bycrypt compares the plain text password with the hashed version
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('password comparison failed');
    }
};

//METHOD: Creating JWT token for this user
userSchema.methods.generateAuthToken = function () {
    const jwt = require('jsonwebtoken');


    console.log("Generating auth token for user:", this.email);
    //create token with user ID and role

    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET || 'fallback-secret-key', //to be set in .env
        { expiresIn: '7d' } //expires in 7 days for good userience vs security balance
    );
};

// Virtual: calculate age based on dateOfBirth
userSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const dob = this.dateOfBirth instanceof Date ? this.dateOfBirth : new Date(this.dateOfBirth);
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

// Ensure virtuals are included when converting to objects / JSON
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

//Update the updatedAt field before saving
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

//Create and export the model
module.exports = mongoose.model('User', userSchema);


