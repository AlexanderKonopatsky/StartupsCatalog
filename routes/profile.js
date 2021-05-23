const {Router} = require('express')
const auth = require('../middleware/auth')
const router = Router()
const Startup = require('../models/startups')
const User = require('../models/user')
const arr = require('../public/dataMarket')

function mapSubId(sub){
    return sub.item.map(c => ({
        ...c.startupId._doc
    }))
}

router.get('/', auth, async (req, res) => {
    try {
        let currentUser = req.user.toObject()
        const user = await req.user.populate('subscription.item.startupId', ).execPopulate()
        let subStartup = mapSubId(user.subscription)

        let newArr = []
        const userLiked = await req.user.subscription.item
        userLiked.map(s => { newArr.push(s.startupId._id) })

        res.render('profile', {
            title: 'Profile',
            titlePage : 'Favorites',
            isProfile: true,
            subStartup,
            currentUser, 
            newArr
        })
    } catch (e) {
        console.log(e)
    }
})

//get user profile by id
router.get('/:id', async (req, res) => {
    try {
        if (req.params.id != 'app.js') {
            let arrStartups = [], newArr = []
            const publishedStartups = await Startup.find({active : true}).populate('userId', 'email name avatarUrl').lean().sort({createdDate: -1})
            publishedStartups.forEach(s => {
                if (s.userId._id == req.params.id)
                    arrStartups.push(s)
            })  
            if (req.user) {
                const userLiked = await req.user.subscription.item
                userLiked.map(s => { newArr.push(s.startupId._id) })
            }
           

        
            const currentUser = await User.findById(req.params.id).lean()
             /* const user = await User.findById(idUser)
    
            const newUser = await user.populate('subscription.item.startupId').execPopulate()

            const starups = newUser.subscription.item.map(s => ({
                ...s.startupId._doc
            }))
             */
            res.render('profile', {
                title: 'Profle', 
                titlePage : 'Published',
                isProfile: true,
                userId: req.user ? req.user._id.toString() : null,
                subStartup : arrStartups,
                newArr,
                currentUser
            })  

        } else {
            res.end('')
        }
    } catch (e) {
        console.log(e)
    }
})

//add or remove a subscribe for user
router.post('/:_id', auth, async (req, res) => {
    try {

        const startup = await Startup.findById(req.params._id)
        await req.user.followStartup(startup)

        let arraySub = req.user.subscription.item;

        let lc = startup.likeCount
        //console.log('Was like ', lc)
        let check = arraySub.some((el) => { return el.startupId === startup._id })
        
        if (check)   lc++
        else lc--
        //console.log('Will like ', lc)
        await Startup.findByIdAndUpdate(req.params._id, { likeCount : lc})
        const startup2 = await Startup.findById(req.params._id)

        let s = { startup2 }
        res.status(200).json(s)
        
    } catch (e) {
        console.log(e)
    }
})

module.exports = router