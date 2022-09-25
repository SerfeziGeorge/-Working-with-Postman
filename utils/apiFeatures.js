class APIFeatures {
  // query = mongoose query (Tour.find()), querystring = coming from the express route (req.query)
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  //Build query

  filter() {
    //create a copy of queryStrjng obj by using destructuring and create a new object. The tree dots takes out all the fileds. Created a new object containing all the key-value pairs that were req.query object.
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering https://docs.mongodb.com/manual/reference/operator/query/
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // ex replacing gte with $gte which is a monngodb operator

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //if there is a sort property then will sort the results based on the values
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // link to add a second criteria, in case the first criteria (ex price) is identical
      this.query = this.query.sort(sortBy); // the value of the field
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // in order to allow clients to choose witch fields to get back in the response, ex is interested in just name and price, or just size.
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' '); // here we spilt the string so that mongodb can include the selected fields in the response
      this.query = this.query.select(fields); //here is the result. Here mongodb expects a string with name then space, then price then space etc in order to select only those field names. This operation is called projecting
    } else {
      // else add a default in case user does not specify any fields
      this.query = this.query.select('-__v'); // excluding the property giving by mongodb in the response. we have in the response object every field excluding __v.
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //converts a string to a number by multiply by one. Because each time you put a number in query string it will be converted to a string in the query object. ||1 means by default you are at page #1.
    const limit = this.queryString.limit * 1 || 100; // setting the default limit to 100 items per page
    const skip = (page - 1) * limit; //calculate the skip value

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
