const mongoose = require('mongoose');


// Allow Promises
mongoose.Promise = global.Promise;

// Connection
mongoose.connect(process.env.MONGODB_URL,  { useFindAndModify: false });