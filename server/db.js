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

// const url = 'mysql://o4kdycj8g7al358ye0la:pscale_pw_qLrlC1VHPRlcuq1pK8CPjCJsOtQKUb22yoWRERrXBzE@us-east.connect.psdb.cloud/cosc-3380-team-project-db?ssl={"rejectUnauthorized":false} : false'
// const pool = mysql.createPool(url)
// module.exports = pool;
