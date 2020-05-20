const Product = require('../models/product')
const User = require('../models/user')


exports.getProduct = (req, res, next) => {
    Product.find().then(product => {
        res.status(200).json({
            message: 'fetch all product',
            products: product
        })
    }).catch(err => console.log(err))
}

/////////////////////////////////////////////////////////////////////

exports.postProduct = (req, res, next) => {
    const {title, price, description } = req.body
    const newProduct = new Product({
        title: title,
        price: price,
        description: description
    })
    User.findById(req.userId).then(user => {
        if(!user) {
            const err = new Error('invlaid user id')
            err.status = 404
            throw err
        }
        user.ordered.push(newProduct)
        return user.save()
    }).then(user => {
        res.status(200).json({
            message: 'done',
            data: user
        })
    }).catch(err => console.log(err))
}