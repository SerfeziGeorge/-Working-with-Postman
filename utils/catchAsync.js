// Breakdown
// 1. catchAsync returns another function > return (req, res, next) =>{fn(req, res, next).catch(next);}<

// 2. Express calls the fn function witch then creates the new product

// 3. this line > fn(req, res, next)< calls the function we called initially, fn, then fn executes the code

// 4. if errors appear, they will be catch by the catch method

// 5. the catch method passes the error into the next function, and the error ends up in the the globalErrorHandler

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //shorthand for (err=>next(err))
  };
};
