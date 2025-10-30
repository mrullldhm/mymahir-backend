const express = require('express');
const router = express.Router();
const database = require('../../database');

// <<<<<<< HEAD
const jwt = require('jsonwebtoken');

function verifyToken(req,res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({
            success:false,
            message: 'Access denied. No token provided'
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if(error) return res.status(403).json({
            success:false,
            message: 'Invalid token'
        });
        req.user = user;
        next();
    })
}

// =======
// >>>>>>> d3dcb86d123f6728cbb1bae7861a03ea47b0dd61
// Get all students (API)
router.get('/', async (req, res) => {
    try{
        const [rows] = await database.query(
            'SELECT * FROM users')
            res.json({
                success:true,
                message: 'Students retrieved successfully',
                data: rows
            });
    } catch(error){
        console.error('Error retrieving students:', error.message);
        res.status(500).json({
            success:false,
            message: 'Students retrieval failed',
            error: error.message
        });
    }
});

// Get student by ID (API)
router.get('/:id', async (req, res) => {
    try{
        const [rows] = await database.query(
            'SELECT * FROM users WHERE id = ?', [req.params.id]
        );

        // Error handling for student not found
        if(rows.length === 0){
            return res.status(404).json({
                success:false,
                message:'Student not found'
            });
        }
        //success response
        res.json({
            success: true,
            message: 'Student details retrieved successfully',
            data: rows[0]
        })
    } catch (err){
        console.error(err);
        res.status(500).json({
            success:false,
            message: 'Failed to retrieve student details',
            error:err.message
        })
    }
});

// Post add new student (API)
router.post('/add', verifyToken,async (req,res) =>{
    const data = {...req.body, ...req.query};
    const {name, student_no, email, phone} = data;
    const errors = [];

    //Validation
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }

    if(!student_no || !/^\d+$/.test(student_no)){
        errors.push('Student number must contain numbers only');
    }

    if(errors.length > 0){
        return res.status(400).json({
            success:false,
            message: 'Validation errors',
            errors
        })
    }

    try {
        // Insert new student into the database
        const [result] = await database.query(
            'INSERT INTO users (name, studentno, email, phone) VALUES(?,?,?,?)', 
            [name, student_no, email, phone]
        )
        res.status(201).json({
            success:true,
            message: 'Student added successfully',
            data:{
                id:result.insertId,
                name,
                student_no,
                email,
                phone,
            }
        })

    } catch (error) {
        console.error('Error adding student:', error.message);
        res.status(500).json({
            success:false,
            message: 'Failed to add student',
            error: error.message
        });
    }
}); 

// Update student by ID (API)
router.put('/update/:id', async(req,res) => {
    const data = {...req.body, ...req.query};
    const {name, student_no, email, phone} = data;
    const errors = [];

    // Validation
    if(!name || name.trim() === ''){
        errors.push('Name is required');
    }
    if (!student_no || !/^\d+$/.test(student_no) ) {
        errors.push('Student number must contain numbers only');
    }

    if(errors.length > 0){
        return res.status(400).json({
            success:false,
            message: 'Validation errors',
            errors
        })
    }

    try {
        const [result] = await database.query(
            'UPDATE users SET name=?, studentno=?, email=?, phone=? WHERE id=?',
            [name, student_no,email,phone, req.params.id]
        )
        // Error not found handling
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success:false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success:true,
            message: 'Student updated successfully',
            data:{
                id: result.insertId,
                name,
                student_no,
                email,
                phone,
            }
        })

    } catch (error) {
        console.error('Error updating student:', error.message);
        res.status(500).json({
            success:false,
            message: 'Failed to update student',
            error: error.message
        });
    }

});

// Delete student by ID (API)
router.delete('/delete/:id', async(req, res) => {
    try {
        const studentId = req.params.id;

        //Delete student from database
        const [result] = await database.query(
            'DELETE FROM users WHERE id = ?', [studentId]
        );

        // Error handling for student not found
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success:false,
                message: 'student not found'
            })
        }
        res.status(200).json({
            success:true,
            message: 'Student deleted successfully',
            data: {id: studentId}
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success:false,
            message: 'Failed to delete student',
            error: error.message
        })
    }

})






// >>>>>>> d3dcb86d123f6728cbb1bae7861a03ea47b0dd61
module.exports = router;