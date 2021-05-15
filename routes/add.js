const {Router} = require('express')
const {validationResult} = require('express-validator')
const {startupValidator} = require('../utils/validators')
const router = Router()
const Startup = require('../models/startups')
const regionData = require('../public/dataRegion')
const marketArray = require('../public/dataMarket')
const auth = require('../middleware/auth')

const reg1 = regionData.regionEurope;
const reg2 = regionData.regionAsia;
const reg3 = regionData.regionSouthAmerica
const reg4 = regionData.regionNorthAmerica;
const reg5 = regionData.regionAfrica;
const markets = marketArray.text;


router.get('/', auth, (req, res) => {
    let isAdmin = false 
    if (!(req.hasOwnProperty('user') && req.user.role == 'USER'))  isAdmin = true
    res.render('add', { title: 'Add', isAdd: true, reg1, reg2, reg3, reg4, reg5, marketArray, isAdmin, username: req.user.name, } )
} )

router.post('/', auth, startupValidator, async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors)
        let errMsg = errors.array()[0].msg

        return res.status(422).render('add', {
            title: 'Add',
            isAdd: true,
            reg1, reg2, reg3, reg4, reg5,
            marketArray, 
            data : {
                title: req.body.title,
                desc: req.body.desc,
                full_desc: req.body.full_desc,
                resource_link: req.body.resource_link,
                img: req.body.img,
                region: req.body.region,
                country: req.body.country,
                market_type: req.body.market,
            },
            errorStartup : errMsg, 
        })
    }

    const startup = new Startup({
        title: req.body.title,
        desc: req.body.desc,
        full_desc: req.body.full_desc,
        resource_link: req.body.resource_link,
        img: req.body.img,
        region: req.body.region,
        country: req.body.country,
        market_type: req.body.market,
        userId: req.user,
        likeCount : 0,
        active: false
    })

    try {
        await startup.save()
        res.render('add', {
            title: 'Add',
            isAdd: true,
            afterPublish: true
        })
       
    } catch (e) {
        console.log(e)
    }
    
})

module.exports = router


