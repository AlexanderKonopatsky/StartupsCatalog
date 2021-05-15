const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email', 'Enter correct email')
        .isEmail()
        .custom( async (value, {req}) => {
            try {
                const user = await User.findOne({email : value})
                if (user) {
                    return Promise.reject('This email already exists')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(), 
    body('password', 'Password length must be between 5 and 50 characters')
        .isLength({min : 5, max : 50})
        .isAlphanumeric()
        .trim(),
    body('confirm', 'Passwords must match')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match')
            } 
            return true
        })
        .trim(),
    body('name', 'Name must be longer than 2 characters')
        .isLength({min : 2, max : 100})
]

exports.loginValidators = [
    body('email', 'Enter correct email')
        .isEmail()
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email : value})
                if (!user) {
                    return Promise.reject('User with this email does not exist')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password', 'Incorrect password')
        .isLength({min : 5, max : 50})
        .isAlphanumeric()
        .trim()
]

exports.startupValidator = [
    body('title', 'Length titles from 3 to 100 characters').isLength({min : 3, max : 100}),
    body('desc', 'Length Short desc from 3 to 100 characters').isLength({max : 100}),
    body('img', 'Enter the correct url').isURL()

]