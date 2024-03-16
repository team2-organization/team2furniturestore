const http = require('http');
const url = require('url');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mg = require('mailgun-js');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const upload = multer();
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();



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
      // console.log('1');
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
    } else if (req.url === '/db/orders') {
      pool.query('SELECT * FROM orders', (error, orders) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(orders));
        }
      });
    } else if (req.url === '/db/orders/mine') {
      const authorization = req.headers.authorization;

      if (authorization) {
        const token = authorization.slice(7); // Remove 'Bearer ' prefix
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
          if (err) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid Token' }));
          } else {
            req.user = decode;
            const theUser = req.user._id;
            console.log(theUser);

            pool.query(
              'SELECT * FROM orders WHERE user_id = ?',
              [theUser],
              (error, orders) => {
                if (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error }));
                } else {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(orders));
                }
              }
            );
            // If authentication is successful, you can proceed with the rest of your logic here
          }
        });
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'No Token' }));
      }
    } else if (req.url === '/db/users') {
      pool.query('SELECT * FROM users', (error, orders) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(orders));
        }
      });
    } else if (req.url === '/db/orders/summary') {
      // Execute both queries concurrently using Promise.all()
      Promise.all([
        new Promise((resolve, reject) => {
          pool.query(
            `SELECT
              NULL AS _id,
              COUNT(*) AS numOrders,
              SUM(totalPrice) AS totalSales
              FROM orders;`,
            (error, orders) => {
              if (error) {
                reject(error);
              } else {
                resolve(orders);
              }
            }
          );
        }),
        new Promise((resolve, reject) => {
          pool.query(
            `SELECT
              NULL AS _id,
              COUNT(*) AS numUsers
              FROM users;`,
            (error, users) => {
              if (error) {
                reject(error);
              } else {
                resolve(users);
              }
            }
          );
        }),
        new Promise((resolve, reject) => {
          pool.query(
            `SELECT
            DATE(createdAt) AS _id,
            COUNT(*) AS orders,
            SUM(totalPrice) AS sales
          FROM orders
          GROUP BY DATE(createdAt)
          ORDER BY DATE(createdAt) ASC;`,
            (error, dailyOrders) => {
              if (error) {
                reject(error);
              } else {
                resolve(dailyOrders);
              }
            }
          );
        }),
        new Promise((resolve, reject) => {
          pool.query(
            `
    SELECT title AS _id, COUNT(*) AS count
    FROM categories
    GROUP BY title;
  `,
            (error, productCategories) => {
              if (error) {
                reject(error);
              } else {
                resolve(productCategories);
              }
            }
          );
        }),
      ])

        .then(([orders, users, dailyOrders, productCategories]) => {
          // Both queries have completed successfully
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              orders: orders,
              users: users,
              dailyOrders: dailyOrders,
              productCategories: productCategories,
            })
          );
        })
        .catch((error) => {
          // Handle errors
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        });
    } else if (pathnameSegments[3] === 'detail') {
      const idd = pathnameSegments[4];

      pool.query('SELECT * FROM orders WHERE _id = ?', [idd], (error, data) => {
        if (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });

          res.end(JSON.stringify(data[0]));
        }
      });
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

    if (req.url === '/db/upload') {
      try {
        // Use Multer middleware to parse the file
        upload.single('file')(req, res, async (err) => {
          if (err) {
            console.error(err);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Error uploading file');
            return;
          }

          // Access the parsed file from req.file
          const file = req.file;
          console.log(file);

          if (!file) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('No file uploaded');
            return;
          }

          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_KEY,
            api_secret: process.env.CLOUDINARY_SECRET,
          });

          const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                  if (result) {
                    resolve(result);
                  } else {
                    reject(error);
                  }
                }
              );

              streamifier.createReadStream(buffer).pipe(stream);
            });
          };

          try {
            const fileBuffer = fs.readFileSync(file.path);
            streamUpload(fileBuffer)
              .then((result) => {
                console.log(result);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
              })
              .catch((error) => {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error uploading file to Cloudinary');
              });
          } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading file');
          }
        });
      } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }

    if (req.url === '/db/idd/products/') {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
        // console.log(chunk)
      });

      req.on('end', () => {
        const body = JSON.parse(data);

        const name = body.name;
        const slug = body.slug;
        const image = body.image;
        const price = body.price;
        const category = body.category;
        const brand = body.brand;
        const countInStock = body.countInStock;
        const rating = 0;
        const numReviews = 0;
        const description = body.description;
        const images = '[]';
        const reviews = '[]';

        pool.query(
          'INSERT INTO products (name, slug, image, price, category, brand, countInStock, rating, numReviews, description, images, reviews )VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [
            name,
            slug,
            image,
            price,
            category,
            brand,
            countInStock,
            rating,
            numReviews,
            description,
            images,
            reviews,
          ],
          (error, product) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });

              res.end(JSON.stringify(product));
            }
          }
        );
      });

      if (req.url === '/db/products/upload/') {
        const insertQuery =
          'INSERT INTO orders (orderItems, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, user_id, user_name, isPaid, isDelivered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        let orderItem = req.body.orderItems.map((x) => ({
          ...x,
          product: x._id,
        }));
        let orderItems = [JSON.stringify(orderItem)];
        let paymentMethod = req.body.paymentMethod;
        let itemsPrice = req.body.itemsPrice;
        let shippingPrice = req.body.shippingPrice;
        let taxPrice = req.body.taxPrice;
        let totalPrice = req.body.totalPrice;
        let user = req.user._id;
        let user_name = req.user.name;
        let isPaid = 'false';
        let isDelivered = 'false';

        pool.query(
          insertQuery,
          [
            orderItems,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            user,
            user_name,
            isPaid,
            isDelivered,
          ],
          (error, result) => {
            if (error) {
              console.error(error);
              res.status(500).send('Internal Server Error');
            } else {
              const data = JSON.parse(orderItems[0]);
              const promises = data.map((item) => {
                return new Promise((resolve, reject) => {
                  const { _id, quantity } = item;
                  const sql = `UPDATE products SET countInStock = countInStock - ? WHERE _id = ?`;
                  pool.query(sql, [quantity, _id], (error, result) => {
                    if (error) {
                      console.error(error);
                      reject(error);
                    } else {
                      resolve();
                    }
                  });
                });
              });

              Promise.all(promises)
                .then(() => {
                  res.status(201).send({
                    orderItems: orderItems,
                    paymentMethod: paymentMethod,
                    itemsPrice: itemsPrice,
                    shippingPrice: shippingPrice,
                    taxPrice: taxPrice,
                    totalPrice: totalPrice,
                    user: user,
                    isPaid: isPaid,
                    isDelivered: isDelivered,
                  });
                })
                .catch((error) => {
                  console.error('Error updating countInStock:', error);
                  res.status(500).send('Error updating countInStock');
                });
            }
          }
        );
      }

      if (req.url === '/reset-password') {
        jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decode) => {
          if (err) {
            res.status(401).send({ message: 'Invalid Token' });
          } else {
            User.findOne({ resetToken: req.body.token }, (err, user) => {
              if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
              } else {
                if (user) {
                  if (req.body.password) {
                    user.password = bcrypt.hashSync(req.body.password, 8);
                    user.save((err) => {
                      if (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                      } else {
                        res.send({
                          message: 'Password reseted successfully',
                        });
                      }
                    });
                  }
                } else {
                  res.status(404).send({ message: 'User not found' });
                }
              }
            });
          }
        });
      }
    }

    if (req.url === '/forget-password/') {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });

      req.on('end', () => {
        const body = JSON.parse(data);
        const email = body.email;

        const query = 'SELECT * FROM users WHERE email = ?';
        pool.query(query, [email], (error, result) => {
          if (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          } else {
            const user = result[0];
            if (!user) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'User not found' }));
            } else {
              const token = jwt.sign(
                { _id: user._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: '3h',
                }
              );
              user.resetToken = token;
              sendEmail(
                user.email,
                'Reset password',
                `${baseUrl()}/reset-password/${token}`
              )
                .then(() => {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(
                    JSON.stringify({
                      message: 'We sent reset password link to your email.',
                    })
                  );
                })
                .catch((error) => {
                  console.error(error);
                  res.writeHead(500, { 'Content-Type': 'text/plain' });
                  res.end('Internal Server Error');
                });
            }
          }
        });
      });
    }
  } else if (req.method === 'PUT') {
    if (req.url === '/profile') {
      const id = pathnameSegments[4];
      const query = 'SELECT * FROM users WHERE _id= ?';
      pool.query(query, [id], (error, user) => {
        if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        } else {
          if (user.length > 0) {
            user = user[0];
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
              user.password = bcrypt.hashSync(req.body.password, 8);
            }

            const name = req.body.name;
            const email = req.body.email;
            const password = req.body.password
              ? bcrypt.hashSync(req.body.password, 8)
              : user.password;

            const updateQuery = `UPDATE users SET name = ?, email = ?, password = ? WHERE _id = ?`;

            pool.query(
              updateQuery,
              [name, email, password, req.user._id],
              (error, updatedUser) => {
                if (error) {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                } else {
                  res.send({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isAdmin: updatedUser.isAdmin,
                    token: generateToken(updatedUser),
                  });
                }
              }
            );
          } else {
            res.status(404).send({ message: 'User not found' });
          }
        }
      });
    }
  } else {
    if (req.url === '/products') {
      const id = pathnameSegments[4];
      const query = 'SELECT * FROM products WHERE _id= ?';
      pool.query(query, [id], (error, data) => {
        if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        } else {
          const product = data[0][0];
          if (product) {
            const deleteQuery = `DELETE FROM products WHERE _id = ?`;
            pool.query(deleteQuery, [req.params.id], (error, result) => {
              if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
              } else {
                res.send({ message: 'Product Deleted' });
              }
            });
          } else {
            res.status(404).send({ message: 'Product Not Found' });
          }
        }
      });
    }
    if (req.url === '/users') {
      const id = pathnameSegments[4];
      const query = 'SELECT * FROM users WHERE _id= ?';
      pool.query(query, [id], (error, data) => {
        if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        } else {
          const user = data[0][0];
          if (user) {
            const deleteQuery = `DELETE FROM products WHERE _id = ?`;
            pool.query(deleteQuery, [id], (error, result) => {
              if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
              } else {
                res.send({ message: 'User Deleted' });
              }
            });
          } else {
            res.status(404).send({ message: 'User Not Found' });
          }
        }
      });
    }
  }
});



// Set Up Server To Listen For Requests From Port 3001
const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
