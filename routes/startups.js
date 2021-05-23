const {Router} = require('express')
const router = Router()
const Startup = require('../models/startups')

function isEmpty(obj) {
    for (let key in obj) {return false}
    return true
}

async function socketConnection(req) {
    const io = req.io
    io.on('connection', socket => {
        socket.on('liked', async(id) => {
            setTimeout(async () => {
                    if (!isEmpty(id)) {
                        const startupById = await Startup.findById(id.res).select('likeCount').lean()
                        socket.broadcast.emit('like-course', { likeCount : startupById.likeCount, id : startupById._id})
                    }
            }, 1000);
        })
    })
}

let counter = 0

router.get('/', async (req, res) => {
    try { 
        let startupWithLikeArr = [],  startups = {}, page = req.query.page, arrStartups = [], check = true, getMore = false, searchBy = ''

        if (page === undefined) { page = 0 } 

        if (req.hasOwnProperty('user')) {
            const userLiked = await req.user.subscription.item
            userLiked.map(s => startupWithLikeArr.push(s.startupId))
            if (counter == 0) {
                socketConnection(req)
                counter++
            } 
        } 

        if (req.query.title != null && req.query.title != '') {
            check = false
            let query = await Startup.find({active : true}).populate('userId', 'email name avatarUrl').lean()
            let pattern = new RegExp(req.query.title, 'i') 
        
            query.forEach(s => {
                let title = s.title
                let st = title.match(pattern)
                    if (st != null) {
                        arrStartups.push(s)
                    }  
            })  

            res.render('startups', {
                title: 'Front page',
                isIndex: true,
                userId: req.user ? req.user._id.toString() : null,
                startups: arrStartups,
                searchOptions: req.query, 
                startupWithLikeArr,
                getMore : true
            })   

        } else if (page !== 0){
            check = false
            startups = await Startup.find({active : true}).limit(4).skip( page * 4).lean().populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1})
            let s = { startups, startupWithLikeArr }
            res.json(s)
 
        } else if (req.query.country != undefined) {
            startups = await Startup.find({active : true, country : req.query.country}).lean().populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1}) 
            searchBy = req.query.country
        } else if (req.query.region != undefined) {
            startups = await Startup.find({active : true, region : req.query.region}).lean().populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1})
            searchBy = req.query.region
        } else if (req.query.market != undefined)  {
            startups = await Startup.find({active : true, market_type : req.query.market}).lean().populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1})
            searchBy = req.query.market
        } else if (isEmpty(req.query)) { 
            startups = await Startup.find({active : true}).limit(4).skip(page * 4).lean().populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1})
        
            getMore = true
        }

        if (check)  {
            res.render('startups', {
                title: 'Front page',
                isIndex: true,
                userId: req.user ? req.user._id.toString() : null,
                startups,
                searchOptions: req.query,
                startupWithLikeArr,
                getMore,
                searchBy
            })
        }

    } catch (e) {
        console.log(e)
    }
})



module.exports = router