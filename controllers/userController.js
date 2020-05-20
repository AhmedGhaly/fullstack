const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Product = require('../models/product')
const User = require('../models/user')
const user = require('../models/user')

exports.signup = (req, res, next) => {
    const { email, password } = req.body
    User.findOne({email: email}).then(user => {
        if(user) {
            const err = new Error('this email is founded!!')
            err.status = 401
            throw(err)
        }
        return bycrypt.hash(password, 12)

    }).then(hashedPass => {
        const newUser = new User({
            email: email,
            password: hashedPass
        })
        return newUser.save()
    }).then(user => {
        res.status(200).json({
            message: 'welcome',
            user: user
        })
    }).catch(err => console.log(err))
}

exports.login = (req, res, next) => {
    const { email, password } = req.body
    let users
    User.findOne({email: email}).then(user => {
        if(!user) {
            const err = new Error('this email is not founded!!')
            err.status = 401
            throw(err)
        }
        users = user
        return bycrypt.compare(password, user.password)
    }).then(isMatched => {
        if(!isMatched) {
            const err = new Error('wring password')
            err.status = 401
            throw(err)
        }
        const token = jwt.sign({id: users._id}, 'the secrit key for the token migth be long and long het how are uou')
        res.status(201).json({
            message: 'loged in',
            token: token,
            userId: users._id
        })
    }).catch(err => console.log(err))
}


// not completed = authentication
exports.postOrder = (req, res, next) => {
    const { productId } = req.body
    Product.findById(productId).then(product => {
        if(!product) {
            const err = new Error('invlaid id product')
            err.status = 403
            throw(err)
        }
    })
}

exports.getOrder = (req, res, next) => {
    const usserId = req.userId
    User.findById(userId).then(user => {
        if(!user) {
            const err = new Error('this email is not founded!!')
            err.status = 401
            throw(err)
        }
        res.status(200).json({
            data: user.ordered
        })
    })
}