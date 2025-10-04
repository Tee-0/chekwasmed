const mongoose = require('mongoose');
const Medication = require('./models/Medications'); //adjust path if needed
require('dotenv').config();

const medications = [
    {
       
        genericName: "Acetaminophen",
        drugClass: "Analgesic",
        therapeuticArea: "Pain relief"
    },

    {
        
        genericName: "Ibuprofen",
        drugClass: "NSAID",
        therapeuticArea: "Pain & inflammation"
    },
    {
       
        genericName: "Amoxicillin",
        drugClass: "Antibiotic",
        therapeuticArea: "Infections"
    },
    {
        genericName: "Metformin",
        drugClass: "Biguanide",
        therapeuticArea: "Diabetes"
    },
    {
        
        genericName: "Acetylsalicylic Acid",
        drugClass: "NSAID",
        therapeuticArea: "Pain & cardiovascular"
    }



];

async function seed() {
    try {
        console.log("Connecting to MongoDB..."); //
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Drop the old 'Name_1' index if it exists
        try {
            await Medication.collection.dropIndex('Name_1');
            console.log("Dropped old Name_1 index");
        } catch (err) {
            console.log("Name_1 index doesn't exist (this is fine)");
        }

        console.log("Clearing existing medications...");
        await Medication.deleteMany({});

        console.log("Inserting medications...");
        const result = await Medication.insertMany(medications);

        console.log(`Inserted ${result.length} medications`);
        console.log(result);

        mongoose.connection.close();
        console.log("Done, connection closed!");
    } catch (err) {
        console.error("Error seeding medications:", err);
        process.exit(1);
    }

}

seed();