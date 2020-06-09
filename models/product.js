const mongoose = require('mongoose')
const { schema } = require('./user')

const productSchema = mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    imageUrl: String,
    createdAt: Date
})



schema.methods.checkTitle = (title) => {
    return (this.title === title)
}


module.exports = mongoose.model('product', productSchema)