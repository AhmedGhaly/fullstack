const router = require('express').Router()

const userController = require('../controllers/userController')
const isAuth = require('../middleware/isAuth')

router.post('/signup', userController.signup)

router.post('/login', userController.login)

router.post('/order', userController.postOrder)

router.get('/order', isAuth, userController.getOrder)

module.exports = router