const mysql = require('mysql2/promise');
require('dotenv').config();
// const database = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'password',
//     database: 'mydata'
// });
const database = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Test the database connection
(async () => {
    try{
        const connection = await database.getConnection();
        console.log('Database connected successfully.');
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
})();

module.exports = database;