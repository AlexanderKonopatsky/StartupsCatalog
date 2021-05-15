const {Router} = require('express')
const router = Router()
const Startup = require('../models/startups')
const nodemailer = require('nodemailer')
const keys = require('../keys')
const auth = require('../middleware/auth')

const smtpTransport = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
        user: keys.USER_SENDINBLUE, 
        pass: keys.PASSWORD_SENDINBLUE
    }
})

router.get('/', async (req, res) => {
    try {
        let startups = await Startup.find().limit(10).skip(0).populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
        res.render('tableStartups', {
            title: 'Front page',
                isIndex: true,
                userId: req.user ? req.user._id.toString() : null,
                startups,
                searchOptions: req.query, 
                isAdmin: req.user.role == 'USER' ? false : true,
                username: req.user.name
        })
    } catch (e) {
        console.log(e)
        return  res.status(404).send(JSON.stringify({ ERROR: e.message }))
    }
})


router.get('/page/:numberPage', async (req, res) => {
    try {
        let page = req.params.numberPage
        let startups = await Startup.find().limit(10).skip(page * 10).populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
        
        const obj = { startups }
        res.json(obj)
    } catch (e) {
        console.log(e)
    }
})


router.get('/publish/:id', async (req, res) => {
    try {
        const id = req.params.id
        let dateNow = Date.now()
        const startup = await Startup.findByIdAndUpdate(id, {active : true }).populate('userId', 'email name')
        await Startup.findByIdAndUpdate(id, {createdDate : dateNow }).populate('userId', 'email name')
        await smtpTransport.sendMail(publishedStartup(startup.userId.email, startup.title, startup.userId.name))
        res.status(200).json({status: true})
    } catch (e) {
        console.log(e)
    }
})

router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id
        let dateNow = Date.now()
        const startup = await Startup.findByIdAndUpdate(id, {active : false }).populate('userId', 'email name')
        await Startup.findByIdAndUpdate(id, {createdDate : dateNow }).populate('userId', 'email name')
        await smtpTransport.sendMail(deleteStartup(startup.userId.email, startup.title, startup.userId.name))
        res.status(200).json({status: false})
    } catch (e) {
        console.log(e)
    }
})

router.post('/', auth, async (req, res) => {
    const titleField = req.body.title.trim()
    const statusField = req.body.status.trim()
    const emailField = req.body.email.trim()
    let newStartups = [], emptyResult = false, startups

    if (titleField != '' && statusField != '') {
        startups = await Startup.find({$and : [{title: titleField}, {active: statusField}]}).populate('userId', 'email name avatarUrl').lean()
    } else if (titleField != '') {
        startups = await Startup.find({title: titleField}).populate('userId', 'email name avatarUrl').lean()
    } else if (statusField != '' ) {
        startups = await Startup.find({active: statusField}).populate('userId', 'email name avatarUrl').lean()
    } else {
        startups = await Startup.find().populate('userId', 'email name avatarUrl').lean()
    }

    if (emailField) {
        startups.forEach(st => {
            if (st.userId.email == emailField)  {
                newStartups.push(st)
            } 
        })
        startups = newStartups
    }

    if (startups.length == 0) { emptyResult = true }

    res.render('tableStartups', {
        title: 'Front page',
            isIndex: true,
            userId: req.user ? req.user._id.toString() : null,
            startups,
            searchOptions: req.query, 
            isAdmin: req.user.role == 'USER' ? false : true,
            emptyResult
    })
})



module.exports = router