const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    ordered: []
})

module.exports = mongoose.model("user", userSchema)