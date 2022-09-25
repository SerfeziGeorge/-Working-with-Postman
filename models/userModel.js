const crypto = require('crypto'); // build in node
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'], //required input
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: [true, 'Email is already in use! Would you like to login?'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //Set to true if this path should always be included in the results, false if it should be excluded by default.  If it was set to true, and got allUsers, it would show all the encrypted passwords for the users in the db.
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // hide active implementation from user
  },
});

// preMiddleware - Encrypting the passwords before they are saved in the database.
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // hash and salt password, The higher the saltRounds value ${12}, the more time the hashing algorithm takes
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field after the validation was succesfull
  this.passwordConfirm = undefined;
  next();
});

// saving the passwordChangedAt property to mongodb when the password is modified
userSchema.pre('save', function (next) {
  //if we have not modified then name of property, or if the doc is new exit immediatly
  if (!this.isModified('password') || this.isNew) return next();
  //else run the code below
  this.passwordChangedAt = Date.now() - 1000; //fix the issue when the saving in the mongodb is slower than creating the new JWT Token. Delay so the timestap so that athe JWT Token is not created before the property is saved because of poor database connection.
  next();
});

// do not show the inactiv users in getall using query middleware
///^find/ regex that aplies to every query that starts with find, eg findAndUpdate, findAndDelete etc
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// check if the password send by the user login in is the same as the password saved in mongodb by creating an instance method that will be available to all documents of a certain collection. The func wil accept as arg the canditate password and the password saved in mongodb. This.password is not available because in the model we have select to false.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//checks the timestamp, when the JWT token was created, and if the user changed its password after the token was created, if true a new JWT needs to be created
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //if the property that records every time the user changes passwords exists then we do the comparison
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means the user never changed the password
  return false;
};

// create an instance method

userSchema.methods.createPasswordResetToken = function () {
  // create a random string, (32) specify the number of charaters. then convert in a hex string
  //the resetToken will be send to the user, its the reset password
  const resetToken = crypto.randomBytes(32).toString('hex');

  // encryting the reset token, 1 created a hash, 2 update/encryp the newly created resetToken, store the encrypted resetToken as an hex
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //expires after 10 min. 10 min transformed in miliseconds

  return resetToken;
};

//The first argument is the singular name of the collection your model is for. ** Mongoose automatically looks for the plural, lowercased version of your model name.
const User = mongoose.model('User', userSchema);
module.exports = User;
