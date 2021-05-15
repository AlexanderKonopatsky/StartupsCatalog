const {Router} = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const route = Router()

route.get('/', auth, (req, res) => {
    let isAdmin = false
    if (!(req.hasOwnProperty('user') && req.user.role == 'USER'))  isAdmin = true
    res.render('settings', {
        title: 'settings',
        isSettings: true,
        user : req.user.toObject(), 
        username: req.user.name,
        isAdmin
    })
})

route.post('/', auth, async (req, res) => {
    try {
        console.log(req.file)
        const user = await User.findById(req.user._id)

        const toChange = {
            name : req.body.name
        }

        if (req.file) {
            toChange.avatarUrl = req.file.path
        }

        Object.assign(user, toChange)
        
        await user.save()
        res.redirect('/settings')
    } catch(e) {
        console.log(e)
    }
})

module.exports = route