const router = require('express').Router()
const body = require('express-validator').body

const isAuth = require('../middleware/isAuth')
const productController = require('../controllers/productController')


router.get('/', productController.getProduct)

router.get('/product/:id', productController.getOneProduct)

router.post('/product'
    , isAuth
    , body('title').not().isEmpty().withMessage('invalid user')
    , body('price').not().isEmpty().withMessage('invalid user')
        .isNumeric().withMessage('invalid price')
    , productController.postProduct)

router.delete('/product/:productId', productController.deleteProduct)

router.put('/product/:productId'
    , isAuth
    , body('title').not().isEmpty().withMessage('invalid user')
    , body('price').not().isEmpty().withMessage('invalid user')
        .isNumeric().withMessage('invalid price')
    , productController.editeProduct)

module.exports = router