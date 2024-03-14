const http = require('http');
const url = require('url');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mg = require('mailgun-js');
const cors = require('cors');
const nodemailer = require('nodemailer');

// const { generateToken } = require('./utils');

const handleCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
};
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

// Create A Server
const server = http.createServer(async (req, res) => {
  // // Handle Cors Function To Allow Axios
  // handleCors(req, res);
  cors()(req, res, () => {});

  // const isAdmin = (req, res) => {
  //   console.log(req.user);
  //   if (req.user && req.user.isAdmin) {
  //     //  console.log("wfdfw")
  //   } else {
  //     console.log('dsf');
  //     res.writeHead(401, { 'Content-Type': 'application/json' });
  //     res.end(JSON.stringify({ message: 'Invalid Admin Token' }));
  //   }
  // };

  // const isAuth = (req, res) => {
  //   const authorization = req.headers.authorization;

  //   if (authorization) {
  //     const token = authorization.slice(7); // Remove 'Bearer ' prefix
  //     jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
  //       if (err) {
  //         res.writeHead(401, { 'Content-Type': 'application/json' });
  //         res.end(JSON.stringify({ message: 'Invalid Token' }));
  //       } else {
  //         req.user = decode;
  //         console.log('sdsfdf');
  //         // If authentication is successful, you can proceed with the rest of your logic here
  //       }
  //     });
  //   } else {
  //     res.writeHead(401, { 'Content-Type': 'application/json' });
  //     res.end(JSON.stringify({ message: 'No Token' }));
  //   }
  // };

  // // GET Requests
  if (req.method === 'GET') {
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    const pathnameSegments = parsedUrl.pathname.split('/');
    // console.log(pathnameSegments[1])
    const slug = pathnameSegments[pathnameSegments.length - 1];
    // const slug = parsedUrl.query.slug;
    // console.log(slug)
    // Extract the slug parameter from the URL

    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.write(
        '<html><head><title>Hello, World!</title></head><body><h1>Hello, World!</h1></body></html>'
      );
      res.end();
    }

    // Get ALl Users
    if (req.url === '/db/products') {
      console.log('1');
      pool.query('SELECT * FROM products', (error, products) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(products));
        }
      });
    } else if (
      req.url === '/db/products/categories' &&
      pathnameSegments[3] === 'categories'
    ) {
      console.log('2');

      pool.query('SELECT * FROM categories', (error, data) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          const categories = data.map((item) => item.title);
          res.end(JSON.stringify(categories));
        }
      });
    } else if (parsedUrl.pathname === '/db/products/search' && query.category) {
      console.log('3');

      const category = query.category;

      pool.query(
        'SELECT * FROM products WHERE category = ?',
        [category],
        (error, data) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            const products = { products: data };
            res.end(JSON.stringify(products));
          }
        }
      );
    } else if (parsedUrl.pathname === '/db/products/admin' && query.page) {
      console.log('4');

      const page = query.page || 2;
      const pageSize = query.pageSize || 3;

      pool.query('SELECT * FROM products', (error, data) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          const products = { products: data };

          res.end(JSON.stringify(products));
        }
      });
    } else if (pathnameSegments[3] === 'slug') {
      const slugg = pathnameSegments[4];

      pool.query(
        'SELECT * FROM products WHERE slug = ?',
        [slugg],
        (error, data) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });

            res.end(JSON.stringify(data[0]));
          }
        }
      );
    } else if (pathnameSegments[3] === 'id') {
      const idd = pathnameSegments[4];


      pool.query(
        'SELECT * FROM products WHERE _id = ?',
        [idd],
        (error, data) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });

            res.end(JSON.stringify(data[0]));
          }
        }
      );
    }
  } else if (req.method === 'POST') {
    if (req.url === '/db/users/signin') {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
        // console.log(chunk)
      });

      req.on('end', () => {
        const body = JSON.parse(data);

        const email = body.email;

        const password = body.password;

        pool.query(
          'SELECT * FROM users WHERE email = ?',
          [email],
          (error, users) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error }));
            }
            const user = users[0];
            if (users[0]) {
              if (bcrypt.compareSync(password, users[0].password)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user),
                  })
                );
                return;
              } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({ message: 'Wrong username or password' })
                );
              }
            } else {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({ message: 'Wrong username or password' })
              );
            }
          }
        );
      });
    }
  }

  // else if (req.method === "POST") {

  //     // Check For User
  //     if (req.url === "/usercheck") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data+= chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const username = body.username;

  //             db.query(
  //                 "SELECT * FROM users WHERE username = ?",
  //                 [username],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else if (result[0]) {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ message: "User already exists" }));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ message: "User does not exist" }));
  //                     }
  //                 }
  //             )
  //         });

  //     // Get A User
  //     }
  // else if (req.url === "/userlogin") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const username = body.username;
  //             const password = body.password;

  //             db.query(
  //                 "SELECT * FROM users WHERE username = ? AND password = ?",
  //                 [username, password],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else if (result[0]) {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify(result));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ message: "Wrong username or password" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Create A User
  //     } else if (req.url === "/usersignup") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const userid = body.userid;
  //             const firstname = body.firstname;
  //             const lastname = body.lastname;
  //             const status = body.status;
  //             const username = body.username;
  //             const password = body.password;
  //             const datesignedup = body.datesignedup;
  //             const fees = body.fees;

  //             db.query(
  //                 "INSERT INTO users (userid, firstname, lastname, status, username, password, datesignedup, fees) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  //                 [userid, firstname, lastname, status, username, password, datesignedup, fees],
  //                 (error) => {
  //                     if (error) {
  //                         console.log(error);
  //                         res.writeHead(500, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({error: "Do we get this far?"}));
  //                     } else {
  //                         res.writeHead(200, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({ message: "User has signed up successfully" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Check For Admin
  //     } else if (req.url === "/admincheck") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data+= chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const username = body.username;

  //             db.query(
  //                 "SELECT * FROM admins WHERE username = ?",
  //                 [username],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else if (result[0]) {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ message: "Admin already exists" }));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ message: "Admin does not exist" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Get An Admin
  //     } else if (req.url === "/adminlogin") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const username = body.username;
  //             const password = body.password;

  //             db.query(
  //                 "SELECT * FROM admins WHERE username = ? AND password = ?",
  //                 [username, password],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else if (result[0]) {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify(result));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ message: "Wrong username or password" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Create An Admin
  //     } else if (req.url === "/adminsignup") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const adminid = body.adminid;
  //             const firstname = body.firstname;
  //             const lastname = body.lastname;
  //             const username = body.username;
  //             const password = body.password;

  //             db.query(
  //                 "INSERT INTO admins (adminid, firstname, lastname, username, password) VALUES (?, ?, ?, ?, ?)",
  //                 [adminid, firstname, lastname, username, password],
  //                 (error) => {
  //                     if (error) {
  //                         console.log(error);
  //                         res.writeHead(500, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({error: error}));
  //                     } else {
  //                         res.writeHead(200, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({ message: "Admin has signed up successfully" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Add An Item To Available
  //     } else if (req.url === "/addtoavailable") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const itemid = body.itemid;
  //             const title = body.title;
  //             const author = body.author;
  //             const cover = body.cover;
  //             const type = body.type;

  //             db.query(
  //                 "INSERT INTO available (itemid, title, author, cover, type) VALUES (?, ?, ?, ?, ?)",
  //                 [itemid, title, author, cover, type],
  //                 (error) => {
  //                     if (error) {
  //                         console.log(error);
  //                         res.writeHead(500, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({error: error}));
  //                     } else {
  //                         res.writeHead(200, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({ message: "Item has been added successfully to available" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Add An Item To Rented
  //     } else if (req.url === "/addtorented") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const rentedid = body.rentedid;
  //             const duedatems = body.duedatems;
  //             const borrowerid = body.borrowerid;
  //             const name = body.name;
  //             const itemid = body.itemid;
  //             const title = body.title;
  //             const author = body.author;
  //             const cover = body.cover;
  //             const type = body.type;

  //             db.query(
  //                 "INSERT INTO rented (rentedid, duedatems, borrowerid, name, itemid, title, author, cover, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //                 [rentedid, duedatems, borrowerid, name, itemid, title, author, cover, type],
  //                 (error) => {
  //                     if (error) {
  //                         console.log(error);
  //                         res.writeHead(500, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({error: error}));
  //                     } else {
  //                         res.writeHead(200, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({ message: "Item has been added successfully to rented" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Add An Item To Processing
  //     }  else if (req.url === "/addtoprocessing") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const processingid = body.processingid;
  //             const duedatems = body.duedatems;
  //             const borrowerid = body.borrowerid;
  //             const name = body.name;
  //             const itemid = body.itemid;
  //             const title = body.title;
  //             const author = body.author;
  //             const cover = body.cover;
  //             const type = body.type;

  //             db.query(
  //                 "INSERT INTO processing (processingid, duedatems, borrowerid, name, itemid, title, author, cover, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //                 [processingid, duedatems, borrowerid, name, itemid, title, author, cover, type],
  //                 (error) => {
  //                     if (error) {
  //                         console.log(error);
  //                         res.writeHead(500, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({error: error}));
  //                     } else {
  //                         res.writeHead(200, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({ message: "Item has been added successfully to rented" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Add A Fee To Balance
  //     } else if (req.url === "/addtobalance") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const feeid = body.feeid;
  //             const borrowerid = body.borrowerid;
  //             const name = body.name;
  //             const itemid = body.itemid;
  //             const title = body.title;
  //             const type = body.type;
  //             const lateamount = body.lateamount;
  //             const damagedamount = body.damagedamount;
  //             const productid = body.productid;

  //             db.query(
  //                 "INSERT INTO balance (feeid, borrowerid, name, itemid, title, type, lateamount, damagedamount, productid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //                 [feeid, borrowerid, name, itemid, title, type, lateamount, damagedamount, productid],
  //                 (error) => {
  //                     if (error) {
  //                         console.log(error);
  //                         res.writeHead(500, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({error: error}));
  //                     } else {
  //                         res.writeHead(200, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({ message: "Fee have been added successfully to balance" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Get All Users Items From Rented
  //     } else if (req.url === "/rented") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const borrowerid = body.borrowerid;

  //             db.query(
  //                 "SELECT * FROM rented WHERE borrowerid = ?",
  //                 [borrowerid],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify(result));
  //                     }
  //                 }
  //             );
  //         });

  //     // Get All Users Fees From Balance
  //     } else if (req.url === "/balance") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const borrowerid = body.borrowerid;

  //             db.query(
  //                 "SELECT * FROM balance WHERE borrowerid = ?",
  //                 [borrowerid],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify(result));
  //                     }
  //                 }
  //             );
  //         });
  //     } else if (req.url === "/webhook") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const signature = req.headers["stripe-signature"];

  //             try {
  //                 const event = stripe.webhooks.constructEvent(data, signature, endpointSecret);

  //             } catch {
  //                 res.writeHead(400, { 'Content-Type': 'text/plain' });
  //                 res.end(`Webhook Error: ${err.message}`);
  //             }
  //         });

  //     // Add A Message To Contact
  //     } else if (req.url === "/addtocontact") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const contactid = body.contactid;
  //             const name = body.name;
  //             const email = body.email;
  //             const message = body.message;

  //             db.query(
  //                 "INSERT INTO contact (contactid, name, email, message) VALUES (?, ?, ?, ?)",
  //                 [contactid, name, email, message],
  //                 (error) => {
  //                     if (error) {
  //                         console.log(error);
  //                         res.writeHead(500, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({error: error}));
  //                     } else {
  //                         res.writeHead(200, {"Content-Type": "application/json"});
  //                         res.end(JSON.stringify({ message: "Message have been added successfully to contact" }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Get Total Amount Spent By One User
  //     } else if (req.url === "/amountforoneuser") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const userid = body.userid;

  //             db.query(
  //                 "SELECT earnings.itemid, earnings.title, earnings.name, earnings.amount FROM earnings WHERE earnings.borrowerid = ?",
  //                 [userid],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify(result));
  //                     }
  //                 }
  //             );
  //         });

  //     // Get Total Amount Earned From One Item
  //     } else if (req.url === "/amountforoneitem") {
  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);
  //             const itemid = body.itemid;

  //             db.query(
  //                 "SELECT earnings.borrowerid, earnings.title, earnings.name, earnings.amount FROM earnings WHERE earnings.itemid = ?",
  //                 [itemid],
  //                 (error, result) => {
  //                     if (error) {
  //                         res.writeHead(500, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify({ error: error }));
  //                     } else {
  //                         res.writeHead(200, { "Content-Type": "application/json" });
  //                         res.end(JSON.stringify(result));
  //                     }
  //                 }
  //             );
  //         });
  //     }

  // // DELETE Requests
  // } else if (req.method === "DELETE") {
  //     const reqURL = url.parse(req.url, true);
  //     const pathSegments = reqURL.pathname.split("/");

  //     // Delete A User
  //     if (pathSegments.length === 3 && pathSegments[1] === "users") {
  //         const userid = pathSegments[2];

  //         db.query(
  //             "DELETE FROM users WHERE userid = ?",
  //             [userid],
  //             (error) => {
  //                 if (error) {
  //                     res.writeHead(500, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({error: error}));
  //                 } else {
  //                     res.writeHead(200, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({ message: "User has been deleted successfully" }));
  //                 }
  //             }
  //         );

  //     // Delete An Item From Available
  //     } else if (pathSegments.length === 3 && pathSegments[1] === "available") {
  //         const itemid = pathSegments[2];

  //         db.query(
  //             "DELETE FROM available WHERE itemid = ?",
  //             [itemid],
  //             (error) => {
  //                 if (error) {
  //                     res.writeHead(500, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({error: error}));
  //                 } else {
  //                     res.writeHead(200, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({ message: "Item has been deleted successfully from available" }));
  //                 }
  //             }
  //         );

  //     // Delete An Item From Rented
  //     } else if (pathSegments.length === 3 && pathSegments[1] === "rented") {
  //         const rentedid = pathSegments[2];

  //         db.query(
  //             "DELETE FROM rented WHERE rentedid = ?",
  //             [rentedid],
  //             (error) => {
  //                 if (error) {
  //                     res.writeHead(500, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({error: error}));
  //                 } else {
  //                     res.writeHead(200, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({ message: "Item has been deleted successfully from rented" }));
  //                 }
  //             }
  //         );

  //     // Delete An Item From Processing
  //     } else if (pathSegments.length === 3 && pathSegments[1] === "processing") {
  //         const processingid = pathSegments[2];

  //         db.query(
  //             "DELETE FROM processing WHERE processingid = ?",
  //             [processingid],
  //             (error) => {
  //                 if (error) {
  //                     res.writeHead(500, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({error: error}));
  //                 } else {
  //                     res.writeHead(200, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({ message: "Item has been deleted successfully from processing" }));
  //                 }
  //             }
  //         );

  //     // Delete A Fee From Processing
  //     } else if (pathSegments.length === 3 && pathSegments[1] === "balance") {
  //         const feeid = pathSegments[2];

  //         db.query(
  //             "DELETE FROM balance WHERE feeid = ?",
  //             [feeid],
  //             (error) => {
  //                 if (error) {
  //                     res.writeHead(500, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({error: error}));
  //                 } else {
  //                     res.writeHead(200, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({ message: "Fee has been deleted successfully from processing" }));
  //                 }
  //             }
  //         );
  //     }

  //     // Delete A Message From Contact
  //     else if (pathSegments.length === 3 && pathSegments[1] === "contact") {
  //         const contactid = pathSegments[2];

  //         db.query(
  //             "DELETE FROM contact WHERE contactid = ?",
  //             [contactid],
  //             (error) => {
  //                 if (error) {
  //                     res.writeHead(500, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({error: error}));
  //                 } else {
  //                     res.writeHead(200, {"Content-Type": "application/json"});
  //                     res.end(JSON.stringify({ message: "Message has been deleted successfully from contact" }));
  //                 }
  //             }
  //         );
  //     }

  // // PUT Requests
  // } else if (req.method === "PUT") {
  //     const reqURL = url.parse(req.url, true);
  //     const pathSegments = reqURL.pathname.split("/");

  //     // Update A User
  //     if (pathSegments.length === 3 && pathSegments[1] === "users") {
  //         const userid = pathSegments[2];

  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);

  //             db.query(
  //                 "UPDATE users SET `firstname` = ?, `lastname` = ?, `status` = ?, `username` = ?, `password` = ?, `datesignedup` = ?, `fees` = ? WHERE `userid` = ?",
  //                 [body.firstname, body.lastname, body.status, body.username, body.password, body.datesignedup, body.fees, userid],
  //                 (error) => {
  //                     if (error) {
  //                         res.writeHead(500, { 'Content-Type': 'application/json' });
  //                         res.end(JSON.stringify({ error: 'Internal Server Error' }));
  //                     } else {
  //                         res.writeHead(200, { 'Content-Type': 'application/json' });
  //                         res.end(JSON.stringify({ message: 'User has been updated successfully' }));
  //                     }
  //                 }
  //             );
  //         });

  //     // Update An Item In Available
  //     } else if (pathSegments.length === 3 && pathSegments[1] === "available") {
  //         const itemid = pathSegments[2];

  //         let data = "";
  //         req.on("data", (chunk) => {
  //             data += chunk;
  //         });

  //         req.on("end", () => {
  //             const body = JSON.parse(data);

  //             db.query(
  //                 "UPDATE available SET `title` = ?, `author` = ?, `cover` = ?, `type` = ? WHERE `itemid` = ?",
  //                 [body.title, body.author, body.cover, body.type, itemid],
  //                 (error) => {
  //                     if (error) {
  //                         res.writeHead(500, { 'Content-Type': 'application/json' });
  //                         res.end(JSON.stringify({ error: 'Internal Server Error' }));
  //                     } else {
  //                         res.writeHead(200, { 'Content-Type': 'application/json' });
  //                         res.end(JSON.stringify({ message: 'Item has been updated successfully from available' }));
  //                     }
  //                 }
  //             );
  //         });
  //     }
  // }
});

// Handle Cors Function To Allow Axios
// const handleCors = (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     res.writeHead(200);
//     res.end();
//     return;
//   }
// };

// Set Up Server To Listen For Requests From Port 3001
const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
