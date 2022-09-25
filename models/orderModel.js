const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'The order must have a product.'],
    },
    variant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Variant',
      required: [true, 'The order must have a variant.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    address: {
      type: String,
      //required: true,
    },
    // how many total items was on the order
    quantity: {
      type: Number,
      //required: true
    },
    // the price may change in the future. What was the price of items.
    price: { type: Number, require: [true, 'Order must have a price.'] },
    // create a order without stripe, maybe for cash
    paid: {
      type: Boolean,
      default: true,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
    modifiedAt: {
      type: Date,
      default: Date.now(),
      //select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// auto populate the order with the user and products name
// all pre middleware have access to the next func, we must call next()
orderSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'product',
    select: 'name',
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
