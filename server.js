// import express from 'express';
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
//Configure view engine
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join( __dirname, 'views'));

app.use(express.static('public'));

// add the express body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Add Method Override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const cors = require('cors');
const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // allowed request headers
};
app.use(cors(corsOptions));


app.get('/about', (req, res) =>{
    res.send('About Us Page');
});

app.get('/', (req, res) =>{
    res.send('Home Page');
});

app.post('/user', (req, res) =>{
    const name = req.query.name;
    res.status(201).send(`Data received for ${name}`);
})

app.get('/search', (req, res) =>{
    const {q, page} = req.query;
    res.send(`Search Keyword: ${q || 'no keyword'}. Page number: ${page||1}`);
});

const blogRoutes = require('./routes/blogRoutes');
const { title } = require('process');
app.use('/blogs', blogRoutes);

//EJS Template Engine Setup
const posting = [
    {id:1, title:'First Post'},
    {id:2, title:'Second Post'},
    {id:3, title:'Third Post'}
]
app.get('/posting', (req, res) =>{
    res.render('index', {title:' My Posts', posting});
});

app.get('/posting/:id', (req,res)=>{
    const post = posting.find(p => p.id == Number(req.params.id));
    if(!post) return res.status(404).send('Post not found');
        res.render( 'post', { post });
});

//contact route
const contactRoute = require('./routes/contact/contact_route');
app.use('/contacts', contactRoute);

//student route
const studentRoute = require('./routes/students/student_route');
app.use('/students', studentRoute);

//student api route
const studentApiRoute = require('./routes/api/student_api_routes');
app.use('/api/students', studentApiRoute);

//auth api route
const authApiRoute = require('./routes/api/auth_api_routes');
app.use('/api/auth', authApiRoute);

//CORS Middleware

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));