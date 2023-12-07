const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const mongoose = require('mongoose');
const flash = require('connect-flash');

const errorController = require('./controllers/error');

const User = require('./models/user');

const MongoURI = 'mongodb+srv://kumarlalit94111:0r43gIiDkWKJdQdF@cluster0.cuqzerx.mongodb.net/Store?retryWrites=true&w=majority';

const app = express();
const store = new MongoDbStore({
    uri: MongoURI,
    collection: 'sessions'
})

const csrfProt = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({ secret: 'My Secret Key', resave: false, saveUninitialized: false, store: store })
)

app.use(csrfProt);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedin;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use(flash());

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MongoURI)
    .then(() => {
        app.listen(3000, () => {
            console.log('Connected')
        })
    })
    .catch(err => {
        if (err) console.log(err)
    })






