const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Catching Uncaught Exceptions = all error ocurred in sync code, ex. defined variable but never used in the globlal scope. Hosting at the top before any other below executes.
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
// enviroment variables, the dotenv must alwals be before the app.
dotenv.config({ path: './config.env' });

const app = require('./app');

//console.log(process.env)
//replacing the placeholder string with the real password
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,

    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

//const port = process.env.PORT || 8008;
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`beep, bloop, blop, listening to port ${port}...`);
});

// Errors Outside Express Unhandled Rejections, ex.problems conecting to mongoDB. Type of error Unhandled promised rejection
//global handler for Unhandled promised rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
