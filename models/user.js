const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        ref: 'Role'
    },
    resetToken : String, 
    resetTokenExp : Date,
    avatarUrl : String,
    subscription: {
        item: [
            {
                startupId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Startup',
                    required: true,
                }
            }
        ]
    }
})



userSchema.methods.followStartup = function(startup) {
    let items = [...this.subscription.item]
    const idx = items.findIndex(c => {
        return c.startupId.toString() === startup.id.toString()
        
    })

    if (idx < 0) {
        items.push({
            startupId: startup._id
        })
    } else {
        items = items.filter(c => c.startupId.toString() !== startup._id.toString())
    }

    this.subscription = {item : items}
    return this.save()
  }

module.exports = model('User', userSchema)