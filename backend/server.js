//importing required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

//Express app
const app = express();
const PORT = process.env.PORT || 5000;

//MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error(' MongoDB connection error:', err));

//Middleware
app.use(cors()); // Alllows frontend to communicate with backend
app.use(express.json()); //Allows server to read JSON data

//Routes
app.get('/', (req, res)  => {
    res.json ({
        message: 'Welcome to ChekwasMed API!',
        status: 'Server is running successfully',
        timestamp: new Date().toISOString()
    });
});

//Test endpoint for medication conflicts
app.get('/api/test', (req, res) => {
    res.json ({
        message: 'ChekwasMed API test endpoint working!',
        version: '1.0.0'
    });
});

//Basic medication endpoint
app.post('/api/check-conflicts', (req, res) => {
    const{medications} = req.body;

    //return medications received
    res.json ({
        message: 'Conflict check endpoint working',
        medications_received: medications || [],
        conflicts_found: 0
    });
});

//Starting the server
app.listen(PORT, () =>  {
   console.log('Chekwasmed server is running on port ${PORT}');
   console.log('Visit: http://localhost:${PORT}');
});
