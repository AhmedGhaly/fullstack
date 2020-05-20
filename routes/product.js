const router = require('express').Router()

const isAuth = require('../middleware/isAuth')
const productController = require('../controllers/productController')

router.get('/', productController.getProduct)

router.post('/product',isAuth , productController.postProduct)

module.exports = router