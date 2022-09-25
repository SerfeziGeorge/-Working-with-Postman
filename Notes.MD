### The short answer is that REST stands for Representational State Transfer. It’s an architectural pattern for creating web services. A RESTful service is one that implements that pattern. ### source https://blog.ndepend.com/rest-vs-restful/

### Setting up Express and Basic Routing

1.  npm init then npm i express
2.  create app.js (contains all the express config)
3.  install nodemon - in package.json, in script write "start": "nodemon app.js", run in the terminal: npm start, for production mode, run in the terminal: npm run start:prod

- in order to avoid errors in node this how to define production mode:"start:prod": "set NODE_ENV=production&& nodemon server.js",

- copy "const port = 3000;
  app.listen(port, () => {
  console.log(`beep, bloop, blop, listening to port ${port}...`);
  });"

4.  morgan gives back information about the request such as: the http method (GET), url(/api/v1/products), status code and the time and size of the response

5.  create the controllers and the routers
6.  Environment variables
    "start": "set NODE_ENV=development&& nodemon server.js"
    "set NODE_ENV=production&& nodemon server.js"

- there are 2 main environments: development and production
- by default express sets the environment to development
- everything not related to express will be written in server.js
- create config.env, convention for a file for environment variables, install package npm i dotenv

7. Install devDependencies for format code with eslint, the config files is also needed. npm i eslint eslint-config-airbnb eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-node eslint-plugin-prettier eslint-plugin-react prettier ndb --save-dev

- also the dependencies npm i express body-parser dotenv express mongoose morgan nodemon slugify validator bcryptjs jsonwebtoken nodemailer express-rate-limit express-mongo-sanitize helmet hpp xss-clean

8. Using MongoDB with Mongoose

- after creating the project and the cluster, connect the database using the connect button. It will ask for the ip address, username GEORGE, and password: msD3vtvhvdQj782x
- select Network Access and allow IP from everywhere
- choosing the connection method, we will connect using MongoDB Compas app

- Connecting the Database with Express

  - this is the host, @cluster0.mxxhd.mongodb.net, where the database is hosted, after the slash we have the name of the database we want to connect to eg "/test"
  - the config for mongoDB is in server.js, start with installing mongoose npm i mongoose
  - Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js, a higher level of abstraction over mongoDB. Code that then interacts with the database. Features: schemas to model data and relationships, easy data validation, simple query API, middleware, etc.
  - Mongoose schema: where we model the data, describing the structure of the data. default values, and validation;
  - Mongoose model: a wrapper for the schema, providing an interface to the database for CRUD operations. Out of the schema we create the model. And from the model we create the document.

- MCV

  - Model handles the aplication data & business logic
    - examples: creating new products int the DB, checking if user password is correct, validating user input data.
  - Controller handles the application logic
    - managing req & res, bridge between model and view layers.
  - View handles the presentation logic

- CRUD operations test version

  - write in the controller create, read, update, delete. test with postman, url in postman eg: 127.0.0.1:3000/api/v1/products - gets all product, after the / add the id to get one product.
  - source for the methods in the crud operations https://mongoosejs.com/docs/queries.html

- after writing and testing the productModel we will write a script that will import the data from the json format to mongodb (importData.js)
- APIA - Filtering: the user will filter data using a query string

  - the query string is composed of the question mark, after we specify field value pair. The filtering is done in the route where we get all products. req.query is responsible for parsing the data. In mongoose there are 2 ways of writing database queries:
    - the first one is to just use a filter object
    - the second is to use a mongoose method
  - there is a build in that we will use similar to object filter. we will use req.query.
  - How query work in mongoose. The find method is going to return a query object. https://mongoosejs.com/docs/queries.html . In using await, the query executes and come back with match document.
  - APIA - Sorting
    If an object is passed, values allowed are asc, desc, ascending, descending, 1, and -1. If a string is passed, it must be a space delimited list of path names. The sort order of each path is ascending unless the path name is prefixed with - which will be treated as descending.
  - APIA - Pagination ex. 127.0.0.1:3000/api/v1/products?page2&limit=10

- APIA - Aggregation Pipeline Matching and Grouping
  - defining a pipeline where all documents from a certain collection go in order to be process in order to transform them into aggregated results. For example we can use the aggregation pipeline in order to calculate averages, min-max values, etc.
  - with aggregation we can manipulate the data in steps. To pass in the data we create an array of "stages".
  - each of the stages is a object {}
- Virtual properties https://mongoosejs.com/docs/tutorials/virtuals.html,https://mongoosejs.com/docs/2.7.x/docs/virtuals.html
  - in Mongoose, a virtual is a property that is not stored in MongoDB. Virtuals are typically used for computed properties on documents. Example converting miles to km without stories both in the db.
- Mongoose middleware aslo called pre and post hok. We can define functions to run before or after a certain event. https://mongoosejs.com/docs/middleware.html#types-of-middleware
  - mongoose has 4 types of middleware: document middleware, model middleware, aggregate middleware, and query middleware
- Data validation https://mongoosejs.com/docs/validation.html#built-in-validators
  - Validation is defined in the SchemaType. Validation is middleware. Mongoose registers validation as a pre('save') hook on every schema by default.
  - install npm i validator

9. Error Handling with Express

- installing the node debugger npm i ndb --save-dev, start command npm run debug
- you can edit code directly in the ndb
- create handler for unhandled routes
- global error handling middleware
- V7 - Catching errors in Async Functions: here we will go V7 because we will stared the refactoring process by no longer using the try.catch block for handling error in the controllers. We will start using Async Function
  - in errorcontroller differenciating between prod and development error handling
  - marked some mongodb errors, CastError, as operational erorrs in production mode

#### //errors from other libraries in production mode eg mongodb and jwt#### So in the errorController we have a bug in the handlers where the error object with message and the status code does not get passed to the sendErrorProd for the mongodb errors and we do not get the correct status code and message. Handlers where we check for the mongoose bad ObjectId, duplicate key and validation error. If the logic for the handlers is writing in the module.exports the error object is passed to the sendErrorProd and we get back in postman the correct statusCode and the message. The same type of logic was used for the JWT library and there are no issues.

10. Authentication, Authorization and Security

- create user model: name, email, password and passwordConfirmation
- in authController create the user, using signup func
- test in postman 127.0.0.1:3000/api/v1/users/signup
- managing passwords: validation and encryption in mongodb
- after validation in the model we are starting to encrypt the password in userSchema using bcrypt.
- Bcryptjs will first salt the hash the password

  - the term hash means encrypt, salt means bcrypt adds a random string to the password https://heynode.com/blog/2020-04/salt-and-hash-passwords-bcrypt

- Authentication with JWT

  - JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. https://jwt.io/introduction/
  - JWT is a stateless method for auth, we will not store any session state on the server.
  - JWT how it works:
    1.  client makes a login post req
    2.  the servers checks if user & password are correct.
    3.  if user & password are correct a unique JWT for that user is created using a secret string stored on the server
    4.  the server sends the newly created JWT and the client stores in a cookie or in localStorage. The user is auth and logged in the application without leaving any state on the server. The server does not know which user is logged in.
    5.  this means every time a user access protected route, he sends the JWT along with the req. Once the req hit the server, we verify if the JWT is valid...
    - the signature of a JWT is created using the header, the payload and the secret stored on the server.
    - the JWT secret needs to be at least 32 characters long
    - Verifying happends when the server inspect the JWT signature and compares is to the test signature it creates when the request come in. If the test signature created === the original signature from the JWT, this means the data${payload and the header} was not modified. Usually the payload was tampered, but withoat the secret stored on the server they cannot a valid signature.
    6. if the JWT token is valid the requested data will be send to the client || or if the token is not valid the server will send an err response informing the user that he is not allowed to access the requested data.
    7. all comunication must happened over https
  - writing the protected route where check if we have in the authorization the jwt token (if the user is logged in),
  - checking the jwt secret by the server, if the jwt is not valid, the error is handled in the errorController, also if the token expired.
  - Check if the user delete its account and then tries to log in using the delete account info with the token created at the first login.
  - Check if the user changed password after the JWT token was created.

  ### Advanced Postman Setup

  - Setting headers in postman and getting access to them in express
  - in the headers tab: key {Authorization}, value {Bearer} + a string. In authController, protect method we check for the Authorization header and if it starts with Bearer.
  - Invorments in postman - an enviroment is a context where the app is running, we can specify variables for these enviroments, eg development and production
    - when we open the manage enviroments tab the variable property to introduce is URL. In development will have one URL, in prod a different one.
    - {{URL}} is the name of the variable created so we dont have to type in every time http://127.0.0.1:3000/, which stands for local host
    - in signup and login route, select tests, and implement the following pm.environment.set("jwt", pm.response.json().token);
    - the line above automates the JWT token and it should appear as enviroment variable in manage enviroments below the URL
    - if everything is ok in the headers the authorization key should auto complete with the login JWT Token

- Security best practices

  - avoid compromised database by encrypting password (bcrypt) and reset tokens (sha 256)
  - brute force attacks
    - use bcrypt (to make login request slow)
    - implement rate limiting(express-rate-limit), limits number of req coming from a single ip
    - implement maximum login attempts
  - cross site scripting (XSS) attacks
    - store JWT in HTTPOnly cookies, do not store in local storage
    - sanitize user input data to prevent XSS attacks
    - set special HTTP headers (helmet package)
  - denial of service (DOS) attacks
    - implement rate limiting (express-rate-limit)
    - limit body payload (in body-parser)
  - NOSQL query injection (trying to log in without providind a user and password)
    - use mongoose for mongodb (because of SchemaTypes)
    - sanitize user input data

- Other best practices - always use HTTPS otherwise the JWT can be stolen (implemented) - create random password reset token with expiry date (implemented) - deny access to JWT after password change (implemented) - do not commit sensitive config data to GIT - do not send error details to clients (implemented) - prevent Cross-Site Request Forgery (csurf package) - require re-authentication before a high-value action (eg before buying) - implement a blacklist of untrusted JWT - confirm user email address after first creating account - keep user logged in with refresh tokens - implement two-factor auth - prevent parameter pollution causing Uncaught Exceptions

11. Advanced Data Modelling
1. Referencing / Normalized VS Embedding / Denormalized

   - when the data is embedded it is impossible to querry for embedded document on its own
   - when the data is referencing we need 2 queries to get data from referenced doc

   ###

   - we will have products, carts, users and reviews

   ### Two way reference

   - products <=> variants (Parent <=> Child)

   ### Child reference

   - products <= users(Parent <= Child) the products will keep a reference of the user (keeping the id of the user)

   ### Parent reference

   - users => reviews (Parent => Child), the review will keep a reference of the user (keeping the id of the user)
   - products => reviews (Parent => Child), the review will keep a reference of the product (keeping the id of the product)
   - on each review we keep a reference on which product the review was made and which user made the review

   ##### in is possible that the user - order can also be two way reference in case we need to show the user his previous order?

   - users => order (Parent => Child), the order will keep a reference of the user (keeping the id of the user)
   - products => order (Parent => Child), the order will keep a reference of the product (keeping the id of the product)
   - on each order we keep a reference on which product the order was made and which user made the order. The order connects the product and the user. An order can belong to one user.
