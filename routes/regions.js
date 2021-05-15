const {Router} = require('express')
const { route } = require('./startups')
const router = Router()
const regionData = require('../public/dataRegion')
const Startup = require('../models/startups')

const reg1 = regionData.regionEurope;
const reg2 = regionData.regionAsia;
const reg3 = regionData.regionSouthAmerica
const reg4 = regionData.regionNorthAmerica;
const reg5 = regionData.regionAfrica;

router.get('/', (req, res) => {
    let isAdmin = false 
    if (!(req.hasOwnProperty('user') && req.user.role == 'USER'))  isAdmin = true
    res.render('regions', {
        title: 'Regions',
        isRegion: true,
        reg1, reg2, reg3, reg4, reg5,
        username: req.user.name,
        isAdmin
    });
})

router.get('/:country', async (req, res) => {
    try {
        var curCountry = req.params.country.toString();
        const startup = await Startup.find({country : curCountry,  active : true}).lean()
        res.render('region', {
            title: `Region ${curCountry}`,
            startup,
            curCountry
        })
    } catch (e) {
        console.log(e)
    }

})

router.get('/continent/:continent', async (req, res) => {
    try {
        var curCountry = req.params.continent.toString();
        const startup = await Startup.find({region : curCountry,  active : true}).lean()
        res.render('region', {
            title: `Continent ${curCountry}`,
            startup,
            curCountry
        })
    } catch (e) {
        console.log(e)
    }
})

module.exports = router