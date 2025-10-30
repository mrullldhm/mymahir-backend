const express = require('express');
const router = express.Router();
const database = require('../../database');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

//Login User (API)
router.post('/login', async(req, res) =>{
    const data = {...req.body, ...req.query};
    const {email, password} = data;
    const errors = [];

    // Validate required fields
    if(!email) errors.push('Email is required');
    if(!password) errors.push('Password is required');

    try {
        const [rows] = await database.query(
            'SELECT * FROM users WHERE email = ? AND type =?', 
            [email, 'admin']
        )
        if(rows.length === 0){
            return res.status(401).json({
                success:false,
                message: 'Empty email or password'
            });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.hash_password);
        if(!isMatch){
            return res.status(401).json({
                success:false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        res.json({
            success:true,
            message: 'Login successful',
            data:{
                id: admin.id,
                email: admin.email,
                token
            }
        })

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success:false,
            message: 'Login failed',
            error: error.message
        })
    }

})


router.post('/register', async(req, res) =>{
    const data = {...req.body, ...req.query};
    const {name, email, password} = data;
    const errors = [];

    // Validate required fields
    if(!name) errors.push('Name is required');
    // if(!studentno) errors.push('Student Number is required');
    if(!email) errors.push('Email is required');
    // if(!phone) errors.push('Phone is required');
    if(!password) errors.push('Password is required');

    if(errors.length>0){
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    } try {
        const [existingUser] = await database.query(
            'SELECT * FROM users where email =?',[email]
        );
    if(existingUser.length > -0){
        return res.status(409).json({
            success:false,
            message: 'Email is already registered'
        });
    }

    const hash = await bcrypt.hash(password,10);
    const type = 'admin';
    const [result] = await database.query(
        'INSERT INTO users (name, email, hash_password, type) VALUES(?,?,?,?)',
        [name, email, hash, type]
    );

    // Respond with success message
    res.status(201).json({
        success:true,
        message: 'User registered successfully',
        data:{
            id: result.insertId,
            name,
            email,
            hash,
            type,
        }
    })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success:false,
            message: 'Registration failed',
            error: error.message  
        })
    }
})

module.exports = router;