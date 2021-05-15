const {Router} = require('express')
const router = Router()
const Startup = require('../models/startups')
const User = require('../models/user')
const Role = require('../models/role')
const auth = require('../middleware/auth')
const {startupValidator} = require('../utils/validators')
const {validationResult} = require('express-validator')
const { Ability, AbilityBuilder } = require("casl");

const regionData = require('../public/dataRegion')
const marketArray = require('../public/dataMarket')

const reg1 = regionData.regionEurope;
const reg2 = regionData.regionAsia;
const markets = marketArray.text;

function isOwner(startup, req) {
    return startup.userId.toString() === req.user._id.toString()
}

function isEmpty(obj) {
    for (let key in obj) {return false}
    return true
}

async function socketConnection(req) {
    const io = req.io
    io.on('connection', socket => {
        socket.on('liked', async(id) => {
            try {
                
                if (!isEmpty(id)) {
                    const startupById = await Startup.findById(id.res).select('likeCount').lean()
                    socket.broadcast.emit('like-course', { likeCount : startupById.likeCount, id : startupById._id})
                }
            } catch (e) {
                console.log(e)
            }
        })
    })
}

function getUsername(req) {
    if (req.hasOwnProperty('user')) {
        return username = req.user.name 
    } else { return username = ''}
}

router.get('/', async (req, res) => {
    try { 
        let isAdmin = false, newArr = [], startups = {}, page = req.query.page, arrStartups = [], check = true, getMore = false, searchBy = ''

        if (!(req.hasOwnProperty('user') && req.user.role == 'USER'))  isAdmin = true
        if (req.hasOwnProperty('user')) {
            const userLiked = await req.user.subscription.item
            userLiked.map(s => { newArr.push(s.startupId) })
            socketConnection(req)
        } 
        
        if (page === undefined) { page = 0 } 

        if (req.query.title != null && req.query.title != '') {
            check = false
            let query = await Startup.find({active : true}).populate('userId', 'email name avatarUrl').lean()
            let pattern = new RegExp(req.query.title)

            query.forEach(s => {
            let title = s.title
            let st = title.match(pattern)
                if (st != null) {
                    arrStartups.push(s)
                    console.log(s)
                }  
            })  

            res.render('startups', {
                title: 'Front page',
                isIndex: true,
                userId: req.user ? req.user._id.toString() : null,
                startups: arrStartups,
                searchOptions: req.query, 
                isAdmin, 
                newArr,
                username: getUsername(req),
                getMore : true
            })   

        } else if (page !== 0){
            check = false
            startups = await Startup.find({active : true}).limit(4).skip( page * 4).lean().populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
            let s = { startups, newArr }

            res.json(s)
 
        } else if (req.query.country != undefined) {
            startups = await Startup.find({active : true, country : req.query.country}).lean().populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
            searchBy = req.query.country
        } else if (req.query.region != undefined) {
            startups = await Startup.find({active : true, region : req.query.region}).lean().populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
            searchBy = req.query.region
        } else if (req.query.market != undefined)  {
            startups = await Startup.find({active : true, market_type : req.query.market}).lean().populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
            searchBy = req.query.market
        } else if (isEmpty(req.query)) { 
            startups = await Startup.find({active : true}).limit(4).skip(page * 4).lean().populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
            getMore = true
        }

        if (check)  {
            res.render('startups', {
                title: 'Front page',
                isIndex: true,
                userId: req.user ? req.user._id.toString() : null,
                startups,
                searchOptions: req.query,
                isAdmin, 
                newArr,
                username : getUsername(req),
                getMore,
                searchBy
            })
        }

    } catch (e) {
        console.log(e)
    }
})



router.get('/show/:id', async (req, res) => {
    try {
        if(!req.query.allow){
            return res.redirect('/startup')
        }
        const startup = await Startup.findById(req.params.id).lean()
        res.render('startup', {
            title: `Startup ${startup.title} `,
            startup
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/edit/:id', auth, async (req, res) => {

    if(!req.query.allow){
        return res.redirect('/startup')
    }

    try {
        const startup = await Startup.findById(req.params.id).lean()

        // if (!isOwner(startup, req)) {
        //    return res.redirect('/startups')
        //} 

        if (req.user.role !== 'ADMIN') {
            return res.redirect('/startups')
        }

        res.render('edit_startup', {
            title: `Edit startup ${startup.title} `, 
            isEdit: true,
            startup,
            reg1,
            reg2, 
            marketArray
        })
    } catch (e) {
        console.log(e)
    }
    
})

router.post('/edit', auth, startupValidator, async (req, res) => {
    try {
        const id = req.body.id
        delete req.body.id

        const startup  = await Startup.findById(id).lean()

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log(errors)
            let errMsg = errors.array()[0].msg
    
            return res.status(422).render('edit_startup', {
                title: `Edit startup ${startup.title} `, 
                isEdit: true,
                startup,
                errorEdit : errMsg
            })
        }


        //if (!isOwner(startup, req)){
        //    return res.redirect('/startups')
        //}
        if (req.user.role !== 'ADMIN') {
            return res.redirect('/startups')
        }

        await Startup.findByIdAndUpdate(id, req.body, (err, obj) => {
            if (err)  console.log(err) 
        })


        res.redirect('/startups')

    } catch (e) {
        console.log(e)
    }

})

router.post('/remove', auth, async (req, res) => {
    try {
        const startup = await Startup.findById(req.body.id).lean()
        if (!isOwner(startup, req)) {
            return res.redirect('/startups')
        }

        await Startup.deleteOne({
            _id: req.body.id,
        })
        res.redirect('/startups')
    } catch (err) {
        console.log(err)
    }
})

router.get('/admin', async (req, res) => {
    try {
        //req.ability.throwUnlessCan("create", "startupsEdit")

        let startups = await Startup.find().limit(10).skip(1).populate('userId', 'email name avatarUrl').lean().sort({_id:-1}) 
        res.render('tableStartups', {
            title: 'Front page',
                isIndex: true,
                userId: req.user ? req.user._id.toString() : null,
                startups,
                searchOptions: req.query, 
                isAdmin: req.user.role == 'USER' ? false : true
        })
        
    } catch (e) {
        console.log(e)
        return  res.status(404).send(JSON.stringify({ ERROR: e.message }))
    }


})

module.exports = router