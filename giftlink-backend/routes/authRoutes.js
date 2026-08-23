/*jshint esversion: 8 */
// Step 1 - Task 2: Import necessary packages
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Task 1 (Update): Use the body, validationResult from express-validator for input validation
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino'); // Import Pino logger

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

dotenv.config();

// JWT secret setup
const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_super_secreta_123";


// ==========================================
// RUTA DE REGISTRO (/register)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email already exists');
            return res.status(400).json({ error: "Email already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({authtoken, email});
    } catch (e) {
         logger.error(e);
         return res.status(500).send('Internal server error');
    }
});


// ==========================================
// RUTA DE LOGIN (/login)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        
        const theUser = await collection.findOne({ email: req.body.email });

        if (theUser) {
            let result = await bcryptjs.compare(req.body.password, theUser.password);
            if(!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong password' });
            }
            
            const userName = theUser.firstName;
            const userEmail = theUser.email;
            
            let payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };
            const authtoken = jwt.sign(payload, JWT_SECRET);
            
            logger.info('User logged in successfully');
            return res.json({ authtoken, userName, userEmail });
        } else {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
         logger.error(e);
         return res.status(500).send('Internal server error');
    }
});


// ==========================================
// RUTA DE ACTUALIZACIÓN (/update)
// ==========================================
router.put('/update', async (req, res) => {
    // Task 2: Validate the input using `validationResult` and return appropriate message if there is an error.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Task 3: Check if email is present in the header and throw an appropriate error message if not present.
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: find user credentials in database
        const existingUser = await collection.findOne({ email });
        
        if (!existingUser) {
            logger.error('User not found');
            return res.status(404).json({ error: "User not found" });
        }

        existingUser.updatedAt = new Date();
        
        // Actualizamos los campos de nombre si el cliente los envió en la petición
        if (req.body.name) {
            existingUser.firstName = req.body.name;
        }

        // Task 6: update user credentials in database
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );

        // Task 7: create JWT authentication using secret key from .env file
        const payload = {
            user: {
                // Dependiendo de la versión del driver de Mongo, el documento puede estar en updatedUser.value
                id: updatedUser.value ? updatedUser.value._id.toString() : updatedUser._id.toString(),
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        
        logger.info('User profile updated successfully');
        res.json({ authtoken });
    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;