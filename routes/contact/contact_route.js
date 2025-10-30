const express = require('express');
const router = express.Router();

// data in json format
const contacts = [
    {id:1, name:'Alice', phone:'123-456-7890'},
    {id:2, name:'Bob', phone:'987-654-3210'},
    {id:3, name:'Charlie', phone:'555-555-5555'},
    {id:4, name:'Diana', phone:'444-444-4444'},
]
router.get('/', (req,res) => {
    res.render('contact/contacts', {
        title: 'My Contact List',
        content: 'Manage your contacts here.',
        contacts
    })
});

// Page to add new contact

// function renderFormPage(res, error = null){
//     res.render('contact/contact_form',{
//         title: 'Add New Contact',
//         content: 'Fill the form to add a new contact.',
//         error,
//         formAction: '/contacts/add'
//     });
// }

// router.get('/add', (req, res) => renderFormPage(res));


// page to edit contact
function renderEditPage( res, error = null, contact = null){
    const isUpdate = !!contact;
    res.render('contact/contact_form', {
        title: isUpdate ? 'Update Contact' : 'Add New Contact',
        content: isUpdate ? 'Update the contact details.' : 'Fill the form to add a new contact.',
        error,
        contact,
        formAction: isUpdate ? `/contacts/update/${contact.id}?_method=PUT` : '/contacts/add'
    });
}
// Show addd contact form
router.get('/add', (req, res) => renderEditPage(res));

router.post('/add', (req,res) => {
    const {name, phone} = req.body;

    const newContact = {
        id: contacts.length + 1,
        name,
        phone
    };
    contacts.push(newContact);
    res.redirect('/contacts');
});

// Update contact form
router.get('/update/:id', (req,res) => {
    const contact = contacts.find(c => c.id == req.params.id);
    if(!contact) return res.status(404).send('Contact not found');
    renderEditPage(res, null, contact);
});

// Handle update contact
router.put('/update/:id', (req,res)=> {
    const {name, phone} = req.body;
    const contact = contacts.find(c => c.id == req.params.id);
    if(!contact) return res.status(404).send('Contact not found');

    //validation
    if(!name || name.trim() === ''){
        return renderEditPage(res, 'Name cannot be empty', contact);
    }
    if(!phone || !/^\d+$/.test(phone)){
        return renderEditPage(res, 'Phone must be numeric', contact);
    }

    // Update Values and redirect back
    contact.name = name;
    contact.phone = phone;
    res.redirect('/contacts');
});

//page to view contact details
router.get('/:id', (req,res) => {
    const contact = contacts.find(c => c.id == req.params.id);

    if(!contact){
        return res.status(404).send('Contact Details not found');
    }

    res.render('contact/contact_details',{
        title: 'Contact Details',
        content: 'View or edit contact details.',
        contact
    });
});

module.exports = router;