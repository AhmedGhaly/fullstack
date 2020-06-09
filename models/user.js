const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    ordered: [{
        title: String,
        price: Number,
        productId: String,
        description: String,
        amount: Number
    }],
    name: String,
    confirmToken: {type: String, default: ''},
    isConfirm: {type: Boolean, default: false},
    passwordToken: {type: String, default: ''},
    expieredTime: {type: Date}
})

module.exports = mongoose.model("user", userSchema)