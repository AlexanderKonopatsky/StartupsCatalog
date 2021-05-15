const keys = require('../keys')

module.exports = function(email, startupTitle, name) {
    return {
        from: keys.EMAIL_FROM,
        to: email,
        subject: 'Your startup has been deleted',
        html: `
            <p>Hello ${name}!</p>
            <p>Startup with a title - ${startupTitle} was deleted</p>
            <hr/>
            <a href="${keys.BASE_URL}">Startups</a>
        `
    }
}