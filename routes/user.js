const router = require('express').Router()
const body = require('express-validator').body

const userController = require('../controllers/userController')
const isAuth = require('../middleware/isAuth')

router.post('/signup'
    , body('email').not().isEmpty().withMessage('please enter your email')
        .isEmail().withMessage('please enter a valid email')
    , body('name').not().isEmpty().withMessage('please enter your name')
    ,body('password').not().isEmpty().withMessage('please enter your password')
        .isLength({min: 5}).withMessage('please enter a strong one')
    , userController.signup)

router.post('/login'
    , body('email').not().isEmpty().withMessage('please enter your email')
        .isEmail().withMessage('please enter a valid email')
    , userController.login)

router.post('/order'
    , isAuth
    , body('title').not().isEmpty().withMessage('invalid user')
    , body('price').not().isEmpty().withMessage('invalid user')
    , userController.postOrder)

router.get('/order', isAuth, userController.getOrder)

router.delete('/order/:orderId', isAuth, userController.deleteOrder)

router.get('/user/:userId', userController.getUserInfo)

router.get('/confirm/:token', userController.confirmEmail)

router.put('/edite/:userId'
    , body('email').not().isEmpty().withMessage('please enter your email')
        .isEmail().withMessage('please enter a valid email')
    , body('name').not().isEmpty().withMessage('please enter your name')
    , isAuth, userController.editeProfile)


// for forget the password
router.post('/forget'
    , body('email').not().isEmpty().withMessage('please enter your email')
        .isEmail().withMessage('please enter a valid email')
    , userController.forgerPassword)

router.post('/restpassword/:token'
    ,body('pass').not().isEmpty().withMessage('please enter your password')
    ,body('confirmpass').custom((value, {req}) => {
        if(value !== req.body.pass)
            throw "not match"
    })
    , userController.resetPassword)

module.exports = router