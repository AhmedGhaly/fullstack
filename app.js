const http = require('http');
const express = require('express');
const logger = require('morgan');
const cors = require('cors')
const dotenv = require('dotenv')
const boddyParser = require('body-parser')
const multer = require('multer')
const path = require('path')

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


const app = express();
dotenv.config()

app.use(cors())
app.use(boddyParser.json())
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.options('*', cors())


// all routes
const productRouter = require('./routes/product')
const userRouter = require('./routes/user')

require('./confing/db')


app.use(logger('dev'));
app.use(express.json());

app.use('/', productRouter)
app.use('/', userRouter)

// error handling
app.use((req, res, next) => {
    const err = new Error('this page is not found')
    err.status = 404
    next(err)
  })
  
app.use((error, req, res, next) => {
  console.log(error)
  const status = error.status || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});





// set up the server
const port = (process.env.PORT || '8080');
const server = http.createServer(app);
const theServer = server.listen(port);
const io = require('./socket').init(theServer)
io.on('connection', socket => {
  console.log('the socket done')
})



module.exports = app;
