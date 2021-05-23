module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated
    res.locals.csrf = req.csrfToken()
    if (req.session.hasOwnProperty('user') && req.session.user.role == 'ADMIN') {
        res.locals.isAdmin = true
    } else {
        res.locals.isAdmin = false
    }
    if (req.session.hasOwnProperty('user')) res.locals.username = req.session.user.name
    next()
}