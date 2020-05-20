const mongoose = require('mongoose');


// Allow Promises
mongoose.Promise = global.Promise;


// Connection
mongoose.connect('mongodb://localhost:27017/product', { useNewUrlParser: true });