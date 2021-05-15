const express = require('express');
const path = require('path');
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars');
const session = require('express-session')
const helmet = require('helmet')
const compression = require('compression')
const MongoStore = require('connect-mongodb-session')(session)
const http = require('http')
const socketIO = require('socket.io')
const startupRoutes = require('./routes/startups')
const addRoutes = require('./routes/add')
const marketsRoutes = require('./routes/markets')
const regionsRoutes = require('./routes/regions')
const profileRoutes = require('./routes/profile')
const settingRoutes = require('./routes/settings')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth') 
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const erroMiddleware = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const abilityMiddleware = require('./middleware/abilities')

const keys = require('./keys')
const PORT = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app)

const io = socketIO(server)

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
});

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGO_URI
})


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
mongoose.set('useFindAndModify', false);


app.use(function(req, res, next) {
    req.io = io
    next()
})

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: keys.SESSION_KEY, 
    resave: false, 
    saveUninitialized: false, 
    store
}))
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)
app.use(abilityMiddleware)


app.use('/startups', startupRoutes)
app.use('/regions', regionsRoutes)
app.use('/markets', marketsRoutes)
app.use('/profile', profileRoutes)
app.use('/add', addRoutes)
app.use('/auth', authRoutes)
app.use('/settings', settingRoutes)
app.use('/admin', adminRoutes)

app.use(erroMiddleware)

async function start() {
    try {
        await mongoose.connect(keys.MONGO_URI, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true})
        server.listen(PORT, () => console.log(`server is running on port ${3000}`));
    }
    catch (e) {
        console.log(e)
    }
}

start()

