const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const variantRouter = require('./routes/variantRoutes');
const orderRouter = require('./routes/orderRouter');
const categoryRouter = require('./routes/categoryRoutes');

const app = express();

// 1) Global MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

//Development logging
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// express-rate-limit window milisecond, helps prevent brute force and denial of service (DOS) attacks
// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body, body larger than 10kb will not be accepted
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection eg email:{"$gt":""}, a query that is always true, and a valid password
// mongoSanitize filters out all the dollar{$} out from req.params and req.body
app.use(mongoSanitize());

// Data sanitization against XSS
// cleans user input from malicios html
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['ratingsQuantity', 'ratingsAverage', 'price'],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

// Test middleware
// acts as an logger
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

// 2) ROUTES
// the routers are middleware that we mount on the specified path.
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/variants', variantRouter);
app.use('/api/v1/orders', orderRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Unable to find ${req.originalUrl} on this server!`, 404));
});

// Handling errors in the express application by passing operational async errors in globalhandling middleware
app.use(globalErrorHandler);

module.exports = app;
