const express = require('express');
const router = express.Router();
const database = require('../../database');

// Student list page
router.get('/', async (req, res) => {
    try{
        const [result] = await database.query('SELECT * FROM users');
        const students = result;

        res.render('students/students_view',{
            title: 'Student Management System',
            content: 'Manage your students here.',
            students
        });
    } catch (error) {
        console.error('Error fetching students:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

//Render Form Page Student
function renderFormPage(res, error = null, student = null){
    const isUpdate = !!student;
    res.render('students/student_form',{
        title: isUpdate ? 'Update Student' : 'Add New Student',
        content: isUpdate ? 'Fill the form to update the student.' : 'Fill the form to add a new student.',
        error,
        student,
        formAction: isUpdate ? `/students/update/${student.id}?_method=PUT` : '/students/add'
    });
}
// Show add student form
router.get('/add', (req, res) => renderFormPage(res));

// Handle add new student
router.post('/add', async (req, res) => {
    const {name, student_no, email, phone} = req.body;

    const studentData = {
        name,
        studentno : student_no,
        email,
        phone
    }

    if(!name || name.trim() == '')
        return renderFormPage(res, 'Name cannot be empty', studentData);
    if(!student_no || student_no.trim() == '')
        return renderFormPage(res, 'Student Number cannot be empty', studentData);
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return renderFormPage(res, 'Invalid email format', studentData);
    }
    if(!phone || !/^\d+$/.test(phone)){
        return renderFormPage(res, 'Phone must contain only digits', studentData);
    }

    try{
        await database.query(
            'INSERT INTO users (name, studentno, email, phone) VALUES (?, ?, ?, ?)',
            [name, student_no, email, phone]
        );

        // Redirect to student list after successful addition
        res.redirect('/students');
        } catch (error) {
            console.error('Error adding student:', error.message);
            res.status(500).send('Internal Server Error');
        }
});

// Update Student Form
router.get('/update/:id', async(req, res) => {
    try{
        const [rows] = await database.query('SELECT * FROM users WHERE id =?', [req.params.id]);

        if(rows.length === 0){
            return res.status(404).send('Student not found');
        }
        const student = rows[0];
        renderFormPage(res, null, student);
    } catch (error){
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
})

router.put('/update/:id', async (req, res) => {
    const { name, student_no, email, phone } = req.body;

    // reuse user input
    const studentData = {
        id: req.params.id,
        name,
        studentno: student_no,
        email,
        phone
    }

    if (!name || name.trim() == '')
        return renderFormPage(res, 'Name cannot be empty', studentData);
    if (!student_no || student_no.trim() == '')
        return renderFormPage(res, 'Student Number cannot be empty', studentData);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return renderFormPage(res, 'Invalid email format', studentData );
    }
    if (!phone || !/^\d+$/.test(phone)) {
        return renderFormPage(res, 'Phone must contain only digits', studentData);
    }

    try {
        await database.query(
            'UPDATE users SET name = ?, studentno = ?, email = ?, phone = ? WHERE id = ?',
            [name, student_no, email, phone, req.params.id]
        );

        // Redirect to student list after successful update
        res.redirect('/students');
    } catch (error) {
        console.error('Error updating student:', error.message);
        res.status(500).send('Internal Server Error (Update)');
    }
});

// Delete student
router.delete('/delete/:id', async (req, res) => {
    try{
        const studentId = req.params.id;

        // Delete student from database
        const [result] = await database.query('DELETE FROM users WHERE id = ?', [studentId]);

        if(result.affectedRows === 0){
            return res.status (404).send('Student not found');
        }
        // Redirect Back
        res.redirect('/students');
    } catch (error){
        console.error(err);
        res.status(500).send('Database error during deletion');
    }
});

// Student Details Page
router.get('/:id', async(req, res) => {
    try{
        const[rows] = await database.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        const student = rows[0];

        if(!student){
            return res.status(404).send('Student not found');
        }
        res.render('students/student_details',{
            title: 'Student Details',
            content: 'Detailed information about the student.',
            student,
        });
    } catch (error){
        console.error(error.message);
        res.status(500).send('Internal Server Error (View Details)');
    }
})
 


module.exports = router;