const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, 'A product must have a size selected'],
    },
    color: {
      type: String,
      required: [true, 'A product must have a color selected'],
    },

    quantityInStock: {
      type: Number,
      required: [true, 'A product must have a minum quantity of 1'],
      validate: {
        //costum validators are functions that returns true or false
        // validate if the price discount is lower that the total price listed
        validator: function (val) {
          // this only points to current doc on NEW document creation, does not work in update because inside a validator function the "this" is going to point to the current document
          return val > 1;
        },
        message: 'The stock ({VALUE}) should not be equal or below zero',
      },
    },
    sku: {
      type: String,
      unique: true,
      required: [true, 'A product must have a sku'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'A variant must belong to a product.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
    modifiedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  // for virtual properties https://mongoosejs.com/docs/2.7.x/docs/virtuals.html
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Populate Variants
productVariantSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });

  next();
});

const Variant = mongoose.model('Variant', productVariantSchema);

module.exports = Variant; // exports in the productModel
