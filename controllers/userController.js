const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validationResult = require('express-validator').validationResult
const crypto = require("crypto")
const nodeMailer = require("nodemailer")
const sendGridTranport = require('nodemailer-sendgrid-transport')


const User = require('../models/user')


////////////////// setup nodemailer /////////////////////////

const trasport = nodeMailer.createTransport(sendGridTranport({
    auth : {
        api_key : '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'
    }
}))

///////////////////////////////////////////////////////////////////




exports.signup = (req, res, next) => {
    const { email, password, name } = req.body
    const err = validationResult(req)
    let theToken
    if(!err.isEmpty()){
        const error = new Error('test')
        error.status = 401
        error.data = err.array()
        throw error
    }
    crypto.randomBytes(32, (err, buf ) => {
        if(err) {
            const err = new Error('something went wrong!!')
            err.status = 400
            throw err
        }
        const token = buf.toString('hex');
        console.log(token)
        theToken = token
        trasport.sendMail({
            to : email,
            from : 'shop@AhmedGhaly.com',
            subject : 'confirm the email',
            html : `
                <h1> confirm your email</h1>
                <p> click this <a href = "http://localhost:3000/user/confirm/${token}" > link </a> to confirm your email </p>  `
        })
    })
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
            password: hashedPass,
            name: name,
            confirmToken: theToken
        })
        return newUser.save()
    }).then(user => {
        res.status(200).json({
            message: 'welcome',
            user: user
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.login = (req, res, next) => {
    const { email, password } = req.body
    let users
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.status = 401
        error.data = err.array()
        throw error
    }
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
            const err = new Error('wrong password')
            err.status = 401
            throw(err)
        }
        const token = jwt.sign({id: users._id}, process.env.SECRET_STRING)
        res.status(201).json({
            message: 'loged in',
            token: token,
            userId: users._id,
            order: users.ordered,
            isConfirm: users.isConfirm
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.postOrder = (req, res, next) => {
    const { title, price, description, id } = req.body
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.status = 401
        error.data = err.array()
        throw error
    }
    User.findById(req.userId).then(user => {
        if(!user) {
            const err = new Error('invlaid user id')
            err.status = 404
            throw err
        }
        if(user.ordered.find(product => product.productId === id)) {
            user.ordered.find((product, i) => {
                if(product.productId === id){
                    user.ordered[i].amount++
                }
                
            })
            return user.save()
        } else {
            const newProduct = {
                title: title,
                price: price,
                description: description,
                productId: id,
                amount: 1
            }
            console.log(newProduct)
            user.ordered.push(newProduct)
            return user.save()
        }
    }).then(user => {
        res.status(200).json({
            message: 'done',
            data: user
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.getOrder = (req, res, next) => {
    const userId = req.userId
    User.findById(userId).then(user => {
        if(!user) {
            const err = new Error('the user is not founded')
            err.status = 401
            throw(err)
        }
        res.status(200).json({
            data: user.ordered
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}


exports.deleteOrder = (req, res, next) => {
    const orderId = req.params.orderId
    const userId = req.userId
    User.findById(userId).then(user => {
        if(!user){
            const err = new Error('invalid user id')
            errr.status = 404
            throw err
        }
        user.ordered.map((order, i) => {
            if(order.productId === orderId)
                user.ordered.splice(i, 1)
        })
        return user.save()
    }).then(user => {
        res.status(200).json({
            message: 'done',
            user: user
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.getUserInfo = (req, res, next) => {
    const userId = req.params.userId
    User.findById(userId).then(user => {
        if(!user){
            const err = new Error('invalid user id')
            err.status = 404
            throw err
        }
        res.status(200).json({
            message: 'done',
            user: user
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.confirmEmail = (req, res, next) => {
    const token = req.params.token
    User.findOne({confirmToken: token}).then(user => {
        if(!user){
            const err = new Error('invalid user token')
            err.status = 404
            throw err
        }
        return User.findByIdAndUpdate(user._id, {$set: {isConfirm: true, confirmToken: ''}})
    }).then(user => {
        res.status(200).json({
            message: 'confirmed done',
            user: user
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}


exports.editeProfile = (req, res, next) => {
    const userId = req.params.userId;
    const {name, email} = req.body
    let theUser
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.status = 401
        error.data = err.array()
        throw error
    }
    User.findById(userId).then(user => {
        if(!user){
            const err = new Error('invalid user token')
            err.status = 404
            throw err
        }
        theUser = user
        return User.findOne({email: email})
    }).then(user => {
        if(user && email !== theUser.email) {
            const err = new Error("this email is aleardy exist!!")
            err.status = 400
            throw err
        }
        let confirm = false
        if(theUser.email === email)
            confirm = true
        return User.findByIdAndUpdate(userId, {$set: {name: name, email: email, isConfirm: confirm}})
    }).then(user => {
        res.status(200).json({
            message: 'done',
            user: user
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}

exports.forgerPassword = (req, res, next) => {
    const { email } = req.body
    let token
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.status = 401
        error.data = err.array()
        throw error
    }
    crypto.randomBytes(32, (err, buf ) => {
        if(err) {
            const err = new Error('something went wrong!!')
            err.status = 400
            throw err
        }
        token = buf.toString('hex')
    })
    User.findOne({email: email}).then(user => {
        if(!user) {
            const err = new Error("invalid email")
            err.status = 404
            throw err
        }
        console.log(user)
        user.passwordToken = token
        return user.save()
    }).then(user => {
        res.status(200).json({
            message: 'done',
            user: user
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}


exports.resetPassword = (req, res,next) => {
    const { pass } = req.body
    const token = req.params.token
    let myUser
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.status = 401
        error.data = err.array()
        throw error
    }
    User.findOne({passwordToken: token}).then(user => {
        if(!user) {
            const err = new Error('invalid token')
            err.status = 404
            throw err
        }
        myUser = user
        return bycrypt.hash(pass, 12)
    }).then(hashPass => {
        myUser.password = hashPass
        myUser.passwordToken = ''
        return myUser.save()
    }).then(user => {
        res.status(201).json({
            message: 'password updated!',
            user: myUser
        })
    }).catch(err => {
        if(!err.status)
            err.status = 500
        next(err)
    })
}