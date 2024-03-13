// import express from 'express';
// import path from 'path';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import helmet from 'helmet';
// import seedRouter from './routes/seedRoutes.js';
// import productRouter from './routes/productRoutes.js';
// import userRouter from './routes/userRoutes.js';
// import orderRouter from './routes/orderRoutes.js';
// import uploadRouter from './routes/uploadRoutes.js';

// dotenv.config();
// mongoose.set('strictQuery', false);
// const connectionString = process.env.MONGODB_URI;

// const connectDb = async () => {
//   try {
//     await mongoose.connect(connectionString, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     const db = mongoose.connection;
//     db.on('error', console.log);
//   } catch (error) {
//     console.error(error.message);
//   }
// };

// const app = express();
// app.disable('x-powered-by');
// app.disable('x-powered-by');

// app.use(function (req, res, next) {
//   res.removeHeader('x-powered-by');
//   res.removeHeader('set-cookie');
//   res.removeHeader('Date');
//   res.removeHeader('Connection');
//   next();
// });

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/db/keys/paypal', (req, res) => {
//   res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
// });
// app.get('/db/keys/google', (req, res) => {
//   res.send({ key: process.env.GOOGLE_API_KEY || '' });
// });

// app.use('/db/upload', uploadRouter);
// app.use('/db/seed', seedRouter);
// app.use('/db/products', productRouter);
// app.use('/db/users', userRouter);
// app.use('/db/orders', orderRouter);

// app.use((err, req, res, next) => {
//   const errorStatus = err.status || 500;
//   const errorMessage = err.message || 'Something went wrong';
//   return res.status(errorStatus).json({
//     successful: false,
//     status: errorStatus,
//     message: errorMessage,
//     stack: err.stack,
//   });
// });

// const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, "../client/build")));
// app.get('*', (req, res) =>
//   res.sendFile(path.join(__dirname, "../client/index.html"))
//   // res.json(dbinfo)
// );
// connectDb();
// app.use((err, req, res, next) => {
//   res.status(500).send({ message: err.message });
// });

// const port = process.env.PORT || 4000;
// app.listen(port, () => {
//   console.log(`...Listening on port ${port}`);
// });
