const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('./categoryModel');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'], //required input
      unique: true,
      trim: true, //trim removes white space at the begin an the end
      maxlength: [
        40,
        'A product name must have less or equal then 40 characters',
      ],
      minlength: [
        3,
        'A product name must have more or equal then 3 characters',
      ],
    },
    slug: String,
    description: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A product must have a description/summary'],
    },
    imageCover: {
      type: String,
      required: [true, 'A product must have a cover image'],
    },
    images: [String], // saving multiple images as in array of strings in the db
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      validate: {
        //costum validators are functions that returns true or false
        // validate if the price discount is lower that the total price listed
        validator: function (val) {
          // this only points to current doc on NEW document creation, does not work in update because inside a validator function the "this" is going to point to the current document
          return val > 1;
        },
        message: 'The price ({VALUE}) should not be equal or below zero',
      },
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category.'],
    },
    //variants: [ProductVariant],
    variants: {
      type: mongoose.Schema.ObjectId,
      ref: 'Variant',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
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

productSchema.virtual('reviews', {
  ref: 'Review',
  // the name of the field in the review model where the reference (id) to the current model is stored
  foreignField: 'product',
  //the name of the field in the product model that stores the reference
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
productSchema.pre('save', function (next) {
  //create a slug for each of the products. create a slug based on the product name and convert it to lower case. "this" refers to the current process document
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Calculating average itemsQuantity in a category. And each time the number of products in a category change.
productSchema.statics.calcItemQuantity = async function (categoryId) {
  // this keyword points to the current model
  const stats = await this.aggregate([
    // into agregate we need to pass in all the stages we want to aggregate.
    // first select all the products that belong to the category
    {
      // filtering for the category we update,
      $match: { category: categoryId },
    },
    {
      // next stage: calculating the stats. In the group stage the first field we need to specify is the id. And then we specified the common field that all the docs have in common and will be group by '$category'
      $group: {
        _id: '$category',
        // for each category we match we add 1. If there are 6 produts for the current category then for each doc one will get added
        numItem: { $sum: 1 },
      },
    },
  ]);
  console.log(stats);

  // find the current category and updated
  if (stats.length > 0) {
    await Category.findByIdAndUpdate(categoryId, {
      // the stats are stored in an array. [ { _id: 5fe5cfe8435e61225419e126, numRating: 2, avgRating: 3.5 } ]
      itemsQuantity: stats[0].numItem,
    });
  } else {
    await Category.findByIdAndUpdate(categoryId, {
      itemsQuantity: 0,
    });
  }
};

//The first argument is the singular name of the collection your model is for. ** Mongoose automatically looks for the plural, lowercased version of your model name.
const Product = mongoose.model('Product', productSchema);
module.exports = Product; // exports in the productController
