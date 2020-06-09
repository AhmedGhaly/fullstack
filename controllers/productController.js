const validationResult = require('express-validator').validationResult
const fs = require('fs')
const path = require('path')

const socket = require('../socket')
const Product = require('../models/product')


exports.getProduct = (req, res, next) => {
    Product.find().populate('userId')
    .sort({createdAt: -1})
    .then(product => {
        res.status(200).json({
            message: 'fetch all product',
            products: product
        })
        
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.postProduct = (req, res, next) => {
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.status = 401
        error.data = err.array()
        throw error
    }
    const userId = req.userId
    const { title, price, description } = req.body
    if(!req.file) {
        const err = new Error("you should select an image")
        err.status = 422
        throw err
    }
    const imageUrl = req.file.path
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: userId,
        createdAt: Date.now()
    })
    product.save().then(product => {
        return Product.findById(product._id).populate('userId')
    }).then(product => {
        socket.getIo().emit('cards', {action: 'creation', product: product})
        res.status(200).json({
            message: 'done',
            product: product
        })
    })
    .catch(err => {
        console.log(err)
        if(!err.status)
            err.status = 500
        next(err)
    })

}

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId
    Product.findByIdAndDelete(productId).then(product => {
        clearImage(product.imageUrl);
        socket.getIo().emit('cards', {action: 'delete', productId: productId})
        res.status(200).json({
            message: 'done',
            data: product
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })

}

exports.getOneProduct = (req, res, next) => {
    Product.findById(req.params.id).populate('userId').then(pro => {
        res.status(200).json({
            product: pro
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.editeProduct = (req, res, next) => {
    const { title, price, description } = req.body
    const userId = req.userId
    const productId = req.params.productId
    let imageUrl
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.status = 401
        error.data = err.array()
        throw error
    }
    Product.findById(productId).then(product => {
        if(!product) {
            const err = new Error('invalid id for product')
            err.status = 404
            throw err 
        }
        if(req.file) {
            imageUrl  =req.file.path
            clearImage(product.imageUrl)

        } else
            imageUrl = product.imageUrl
        if(product.userId.toString() !== userId) {
            const err = new Error('you not allow to edite it')
            err.status = 404
            throw err 
        }

        else return Product.findById(productId)
    }).then(product => {
        
        product.title =  title
        product.price =  price,
        product.description =  description,
        product.imageUrl =  imageUrl
        return product.save()
    }).then(product => {
        console.log(product)
        socket.getIo().emit('cards', {action: 'edite', product: product})
        res.status(200).json({
            product: product
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}


const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
  };