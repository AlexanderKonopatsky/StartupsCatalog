const {Router} = require('express')
const marketArray = require('../public/dataMarket')


const router = Router()

router.get('/', (req, res) => {
    res.render('markets', {
        title: 'Markets',
        isMarkets: true,
        marketArray,      
    })
})


module.exports = router