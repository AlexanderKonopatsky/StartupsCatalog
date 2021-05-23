module.exports = {
    ifeq(a, b, options) {
        if (a == b) {
            return options.fn(this)
        } else { 
            return options.inverse(this)
        }
    }, 
    isLiked(a, b, options) {
        let check = true     
        b.forEach(el => {
            if (el.toString() == a.toString()) {
                check = false;
            }
        })
        if (check) {
            return options.inverse(this)

        } else {
            return options.fn(this)
        }

    }
}