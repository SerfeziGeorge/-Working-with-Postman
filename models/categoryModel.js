const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A category must have a name'],
      maxlength: [
        40,
        'A category name must have less or equal then 40 characters',
      ],
      minlength: [
        3,
        'A category name must have more or equal then 3 characters',
      ],
      unique: true,
    },
    slug: { type: String },
    imageCover: {
      type: String,
      required: [true, 'A category must have a cover image'],
    },
    images: [String], // saving multiple images as in array of strings in the db
    itemsQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
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

// improves read performance on db
categorySchema.index({ slug: 1 });

// Virtual populate
// getting access to all the products(populating) when quering for a specific category without persisting to the database
categorySchema.virtual('products', {
  ref: 'Product',
  foreignField: 'category',
  localField: '_id',
});
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// all pre middleware have access to the next func, we must call next()
categorySchema.pre('save', function (next) {
  //create a slug for each of the products. create a slug based on the product name and convert it to lower case. "this" refers to the current process document
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category; // exports in the categoryController
