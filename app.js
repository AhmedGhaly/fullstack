const http = require('http');
const express = require('express');
const logger = require('morgan');
const cors = require('cors')
const app = express();


app.use(cors())
app.options('*', cors())


// all routes
const productRouter = require('./routes/product')
const userRouter = require('./routes/user')

require('./confing/db')

app.use(logger('dev'));
app.use(express.json());



app.use('/', productRouter)
app.use('/', userRouter)

// set up the server
const port = (process.env.PORT || '8080');
const server = http.createServer(app);
server.listen(port);



module.exports = app;
