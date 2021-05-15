const keys = require('../keys')

module.exports = function(email) {
    return {
        from: keys.EMAIL_FROM,
        to: email,
        subject: 'Account created',
        html: `
            <h1>Welcome to our site</h1>
            <p>You have successfully created an account with email - ${email}</p>
            <hr/>
            <a href="${keys.BASE_URL}">Startups</a>
        `
    }
}