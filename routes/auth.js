const {Router} = require('express')
const User = require('../models/user')
const Role = require('../models/role')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {registerValidators, loginValidators} = require('../utils/validators')
const {validationResult} = require('express-validator')
const nodemailer = require('nodemailer')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const router = Router()

const smtpTransport = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
        user: keys.USER_SENDINBLUE, 
        pass: keys.PASSWORD_SENDINBLUE
    }
})

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title : 'Login',
        isLogin : true,
        errorLogin : req.flash('errorLogin'),
        errorRegister : req.flash('errorRegister')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() =>   res.redirect('/auth/login')) 
})

router.post('/login', loginValidators, async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({ email })
        
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('errorLogin', errors.array()[0].msg)   
            console.log(errors)    
         
            return res.status(422).render('auth/login', {
                title : 'Login',
                isLogin : true,
                errorLogin : req.flash('errorLogin'),
                errorRegister : req.flash('errorRegister'), 
                error : errors.array()[0].msg,
                data : { email },
                registerActive : false
            })
        }

    
        const areSame = await bcrypt.compare(password, candidate.password)
        
        if (areSame) {
            req.session.user = candidate
            req.session.isAuthenticated = true
            req.session.save((e) => {
                if (e) { throw e }
                else { res.redirect('/startups')}
            })
        } else {
            req.flash('errorLogin', 'Invalid password')
            res.redirect('/auth/login#login')
        }

    } catch (e) {
        console.log(e)
    } 
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, name, password, confirm} = req.body
        
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            req.flash('errorRegister', errors.array()[0].msg)
            console.log(errors)

            return res.status(422).render('auth/login', {
                title : 'Login',
                isLogin : true,
                errorLogin : req.flash('errorLogin'),
                errorRegister : req.flash('errorRegister'), 
                error : errors.array()[0].msg,
                data : { email, name },
                registerActive : true
            })

        }

        const hashPassword = await bcrypt.hash(password, 10)
        if (password == confirm) {
            const userRole = await Role.findOne({value: 'USER'})
            const user = new User({email, name, password : hashPassword, subscription: { item: []}, role : userRole.value})
            await user.save()
            res.redirect('/auth/login') 
            await smtpTransport.sendMail(regEmail(email))
        } else {
            req.flash('errorRegister', "Passwords don't match")
            res.redirect('/auth/login#register')
        }

    } catch (e) {
        console.log(e)
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title : 'Forgot your password?',
        errorReset : req.flash('errorReset'),
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')
            let candidate = await User.findOne({email : req.body.email})
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 3600*1000
                await candidate.save()

                smtpTransport.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')
            } else {

                req.flash('errorReset', 'There is no such email')
                res.redirect('/auth/reset')
            }
        })

    } catch (e) {
        console.log(e)
    }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken : req.params.token,
            resetTokenExp : { $gt: Date.now()}
        })

        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title : 'Restore access',
                errorPassword : req.flash('errorPassword'),
                userId : user._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id : req.body.userId,
            resetToken : req.body.token,
            resetTokenExp : { $gt : Date.now() }
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10 )
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('errorLogin', 'Token expired')
            res.redirect('/auth/login')
        }

    } catch (e) {
        console.log(e)
    }
})

module.exports = router