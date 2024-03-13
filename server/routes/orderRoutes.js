import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { pool } from '../db.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utils.js';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // const orders = await Order.find().populate('user', 'name');
    const orders = await pool.query(`SELECT * from orders`);
    res.send(orders[0]);
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const insertQuery =
      'INSERT INTO orders (orderItems, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, user_id, user_name, isPaid, isDelivered )VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    // console.log(req.body.orderItems)
    let orderItem = req.body.orderItems.map((x) => ({
      ...x,
      product: x._id,
    }));
    // console.log(orderItem)
    // let shippingAddress = req.body.shippingAddress;
    // console.log(orderItem)
    let orderItems = [JSON.stringify(orderItem)];
    // let orderItem = order.orderItems.push(orderItemss)
    let paymentMethod = req.body.paymentMethod;
    let itemsPrice = req.body.itemsPrice;
    let shippingPrice = req.body.shippingPrice;
    let taxPrice = req.body.taxPrice;
    let totalPrice = req.body.totalPrice;
    let user = req.user._id;
    let user_name = req.user.name;
    let isPaid = 'false';
    let isDelivered = 'false';

    await pool.query(insertQuery, [
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
    ]);

    const data = JSON.parse(orderItems[0]);

    try {
      for (const item of data) {
        const { _id, quantity } = item;
        console.log(_id, quantity);
        const sql = `UPDATE products SET countInStock = countInStock - ? WHERE _id = ?`;
        const result = await pool.query(sql, [quantity, _id]);
        // console.log(`Updated countInStock for product with _id ${_id}`);
      }
    } catch (err) {
      console.error('Error updating countInStock:', err);
      res.status(500).send('Error updating countInStock');
    }

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
);

// orderRouter.post(
//   '/updatestock',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const data = JSON.parse(req.body[0]);
//     data.forEach(item => {
//       const { _id, quantity } = item;
//       const sql = `UPDATE product SET countInStock = countInStock - ? WHERE _id = ?`;
//       connection.query(sql, [quantity, _id], (err, result) => {
//         if (err) {
//           console.error('Error updating countInStock:', err);
//           res.status(500).send('Error updating countInStock');
//           return;
//         }
//         console.log(`Updated countInStock for product with _id ${_id}`);
//       });
//     });
//     res.send('Stock updated successfully');
//   })
// );

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orderQuery = `SELECT
NULL AS _id,
COUNT(*) AS numOrders,
SUM(totalPrice) AS totalSales
FROM orders;`;

    const dataOrder = await pool.query(orderQuery);
    const orders = dataOrder[0];

    const usersQuery = `
    SELECT null AS _id, COUNT(*) AS numUsers
    FROM users`;
    const dataUser = await pool.query(usersQuery);
    const users = dataUser[0];

    // const dailyOrders = await Order.aggregate([
    //   {
    //     $group: {
    //       _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
    //       orders: { $sum: 1 },
    //       sales: { $sum: '$totalPrice' },
    //     },
    //   },
    //   { $sort: { _id: 1 } },
    // ]);

    const salesQuery = `SELECT
  DATE(createdAt) AS _id,
  COUNT(*) AS orders,
  SUM(totalPrice) AS sales
FROM orders
GROUP BY DATE(createdAt)
ORDER BY DATE(createdAt) ASC`;

    const salesData = await pool.query(salesQuery);
    const dailyOrders = salesData[0];

    const categoriesQuery = `
    SELECT title AS _id, COUNT(*) AS count
    FROM categories
    GROUP BY title;
  `;
    const data = await pool.query(categoriesQuery);
    const productCategories = data[0];

    res.send({ users, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orderId = req.params.id;

    const query = 'SELECT * FROM orders WHERE _id= ?';
    const data = await pool.query(query, [orderId]);
    const order = data[0][0];
    // const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      mailgun()
        .messages()
        .send(
          {
            from: 'Amazona <amazona@mg.yourdomain.com>',
            to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

export default orderRouter;
