const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.get('Authorization')
    if(!token){
        const err = new Error('not authenticated')
        throw err
    }
    let decodedtoken
    try {
        decodedtoken = jwt.verify(token, 'the secrit key for the token migth be long and long het how are uou')
    }catch (err) {
        throw err
    }
    req.userId = decodedtoken.id
    next()

}