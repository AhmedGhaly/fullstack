const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    title: String,
    price: Number,
    description: String
})

module.exports = mongoose.model('product', productSchema)