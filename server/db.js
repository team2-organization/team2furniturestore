const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config();


// Connect To Database
const pool = mysql.createPool({
    user: "7vi7u0g3pevg6flhfa0t",
    host: "aws.connect.psdb.cloud",
    password: "pscale_pw_x4NuXdb9Zg2geYS6usNK01WYYrZL32gnRoW4dienKTh",
    database: "cosc-3380-team-project-db",
    ssl: "mysql://7vi7u0g3pevg6flhfa0t:pscale_pw_x4NuXdb9Zg2geYS6usNK01WYYrZL32gnRoW4dienKTh@us-east.connect.psdb.cloud/cosc-3380-team-project-db" ?{ rejectUnauthorized: false } : false
});

module.exports = pool;

// const DATABASE_URL = process.env.DATABASE_URL;
// export const pool = mysql.createPool(DATABASE_URL).promise();
