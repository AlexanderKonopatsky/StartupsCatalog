const {Schema, model} = require('mongoose')

const startup = new Schema({
    title: {
        type: String, 
        required: true
    }, 
    desc: {
        type: String,
        required: true
    },
    full_desc: {
        type: String,
        required: true
    },
    resource_link: {
        type: String
    },
    region: {
         type: String
    },
    country: {
        type: String
    },
    market_type: {
        type: String
    },
    img: String,
    userId: {
        type: String,
        ref: 'User'
    }, 
    likeCount: {
        type: Number
    },
    active: {
        type: Boolean
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = model('Startup', startup)