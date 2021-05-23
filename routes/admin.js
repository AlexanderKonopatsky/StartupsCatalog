const {Router} = require('express')
const router = Router()
const Startup = require('../models/startups')
const nodemailer = require('nodemailer')
const keys = require('../keys')
const auth = require('../middleware/auth')
const {startupValidator} = require('../utils/validators')
const {validationResult} = require('express-validator')
const regionData = require('../public/dataRegion')
const marketArray = require('../public/dataMarket')
const reg1 = regionData.regionEurope;
const reg2 = regionData.regionAsia;
const markets = marketArray.text;

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
        req.ability.throwUnlessCan("read", "adminContent")
  
        let startups = await Startup.find().limit(10).skip(0).populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1}) 
        res.render('tableStartups', {
            title: 'Front page',
                isIndex: true,
                userId: req.user ? req.user._id.toString() : null,
                startups,
                searchOptions: req.query, 
        })
    } catch (e) {
        res.status(404).render('404', {  title : 'Page not found' })
    }
})


router.get('/page/:numberPage', async (req, res) => {
    try {
        req.ability.throwUnlessCan("read", "adminContent")

        let page = req.params.numberPage
        let startups = await Startup.find().limit(10).skip(page * 10).populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1})
        
        const obj = { startups }
        res.json(obj)
    } catch (e) {
        res.status(404).render('404', {  title : 'Page not found' })
    }
})


router.get('/publish/:id', async (req, res) => {
    try {
        req.ability.throwUnlessCan("update", "adminContent")
        const id = req.params.id
        let dateNow = Date.now()
        const startup = await Startup.findByIdAndUpdate(id, {active : true }).populate('userId', 'email name')
        await Startup.findByIdAndUpdate(id, {createdDate : dateNow }).populate('userId', 'email name')
        await smtpTransport.sendMail(publishedStartup(startup.userId.email, startup.title, startup.userId.name))
        res.status(200).json({status: true})
    } catch (e) {
        res.status(404).render('404', {  title : 'Page not found' })
    }
})

router.get('/delete/:id', async (req, res) => {
    try {
        req.ability.throwUnlessCan("update", "adminContent")

        const id = req.params.id
        let dateNow = Date.now()
        const startup = await Startup.findByIdAndUpdate(id, {active : false }).populate('userId', 'email name')
        await Startup.findByIdAndUpdate(id, {createdDate : dateNow }).populate('userId', 'email name')
        await smtpTransport.sendMail(deleteStartup(startup.userId.email, startup.title, startup.userId.name))
        res.status(200).json({status: false})
    } catch (e) {
        res.status(404).render('404', {  title : 'Page not found' })
    }
})

router.post('/', auth, async (req, res) => {
    try {
        req.ability.throwUnlessCan("update", "adminContent")

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
                emptyResult
        })

    } catch(e) {
        res.status(404).render('404', {  title : 'Page not found' })
    }

})


router.get('/edit/:id', auth, async (req, res) => {
    try {
        req.ability.throwUnlessCan("update", "adminContent")
        const startup = await Startup.findById(req.params.id).lean()

        res.render('edit_startup', {
            title: `Edit startup ${startup.title} `, 
            isEdit: true,
            startup,
            reg1,
            reg2, 
            marketArray
        })
    } catch (e) {
        res.status(404).render('404', {  title : 'Page not found' })
    }
})

router.post('/edit', auth, startupValidator, async (req, res) => {
    try {
        req.ability.throwUnlessCan("update", "adminContent")
        const id = req.body.id
        delete req.body.id

        const startup  = await Startup.findById(id).lean()

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            let errMsg = errors.array()[0].msg
    
            return res.status(422).render('edit_startup', {
                title: `Edit startup ${startup.title} `, 
                isEdit: true,
                startup,
                errorEdit : errMsg
            })
        }

        if (req.user.role !== 'ADMIN') {
            return res.redirect('/startups')
        }

        await Startup.findByIdAndUpdate(id, req.body, (err, obj) => {
            if (err)  console.log(err) 
        })

        res.redirect('/startups')

    } catch (e) {
        res.status(404).render('404', {  title : 'Page not found' })
    }

})

router.post('/remove', auth, async (req, res) => {
    try {
        req.ability.throwUnlessCan("update", "adminContent")
        await Startup.deleteOne({
            _id: req.body.id,
        })
        res.redirect('/startups')
    } catch (err) {
        res.status(404).render('404', {  title : 'Page not found' })
    }
})


module.exports = router