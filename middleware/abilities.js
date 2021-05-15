const {Ability, AbilityBuilder} = require('casl')

module.exports = function(req, res, next) {
    const {rules, can} = AbilityBuilder.extract()
    let role = ''

    if (req.user == undefined) { role = null } 
    else { role = req.user.role }


    if (role === 'ADMIN') {
        can("read", "all")
        can(["update", "delete", "create"], ["startupsEdit"])
    } 

    if (role === 'USER') {
        can('read', ["startupsEdit"])
    }

    req.ability = new Ability(rules)
    next()
}