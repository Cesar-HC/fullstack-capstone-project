// Step 1 - Task 2: Import necessary packages
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino'); // Import Pino logger

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

dotenv.config();

// JWT secret setup (modificado para evitar el error anterior)
const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_super_secreta_123";

// ==========================================
// RUTA DE REGISTRO
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
// RUTA DE LOGIN (Nuevo código)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB
        const db = await connectToDatabase();
        
        // Task 2: Access MongoDB `users` collection
        const collection = db.collection("users");
        
        // Task 3: Check for user credentials in database
        const theUser = await collection.findOne({ email: req.body.email });

        if (theUser) {
            // Task 4: Check if the password matches the encrypted password
            let result = await bcryptjs.compare(req.body.password, theUser.password);
            if(!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong password' });
            }
            
            // Task 5: Fetch user details from database
            const userName = theUser.firstName;
            const userEmail = theUser.email;
            
            // Task 6: Create JWT authentication if passwords match
            let payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };
            const authtoken = jwt.sign(payload, JWT_SECRET);
            
            logger.info('User logged in successfully');
            return res.json({ authtoken, userName, userEmail });
        } else {
            // Task 7: Send appropriate message if user not found
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
         logger.error(e);
         return res.status(500).send('Internal server error');
    }
});

module.exports = router;