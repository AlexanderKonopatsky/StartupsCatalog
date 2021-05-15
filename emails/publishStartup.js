const keys = require('../keys')

module.exports = function(email, startupTitle, name) {
    return {
        from: keys.EMAIL_FROM,
        to: email,
        subject: 'Your startup has been published',
        html: `
            <p>Hello ${name}!</p>
            <p>Successful publication of a startup with a title - ${startupTitle}</p>
            <hr/>
            <a href="${keys.BASE_URL}">Startups</a>
        `
    }
}