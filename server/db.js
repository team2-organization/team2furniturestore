const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config();


// Connect To Database
const pool = mysql.createPool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    ssl: process.env.DATABASE_URL ?{ rejectUnauthorized: false } : false
});

module.exports = pool;


// const DATABASE_URL = process.env.DATABASE_URL;
// export const pool = mysql.createPool(DATABASE_URL).promise();
