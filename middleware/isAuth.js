const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.get('Authorization')
    if(!token){
        const err = new Error('not authenticated')
        throw err
    }
    let decodedtoken
    try {
        decodedtoken = jwt.verify(token, process.env.SECRET_STRING)
    }catch (err) {
        throw err
    }
    console.log('dfdfd')
    req.userId = decodedtoken.id
    next()

}