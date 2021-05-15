const {Router} = require('express')
const marketArray = require('../public/dataMarket')


const router = Router()

router.get('/', (req, res) => {
    let isAdmin = false 
    if (!(req.hasOwnProperty('user') && req.user.role == 'USER'))  isAdmin = true
    res.render('markets', {
        title: 'Markets',
        isMarkets: true,
        marketArray,
        username: req.user.name,
        isAdmin
        
    })
})


module.exports = router