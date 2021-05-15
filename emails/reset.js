const keys = require('../keys')

module.exports = function(email, token) {
    return {
        from: keys.EMAIL_FROM,
        to: email,
        subject: 'Access recovery',
        html: `
            <h1>Forgot your password?</h1>
            <p>If not, please ignore this letter.</p>
            <p>Otherwise click on the link below: </p>
            <p><a href=${keys.BASE_URL}/auth/password/${token}>Restore access</a></p>
            <hr/>
            <a href="${keys.BASE_URL}">Startups href</a>
        `
    }
}