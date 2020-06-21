const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require("cookie-session");

const db = require("./src/db");
const updateDb = require('./src/wakatimeUpdate');

/* Settings */
app.set('view engine', 'pug');
app.use(express.static('public'));


/* Middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    name: 'session',
    keys: [require('./secret').cookie]
}));

app.use(require('./middlewares/flash'));

app.use((req, res, next) => {
    if (typeof req.session.logged === 'undefined') {
        req.session.logged = false;
    }

    next();
})


/* Routes */
app.use(require("./routes/oauth"));
app.use(require("./routes/userAuth"));

app.post('/update', (req, res) => {
    if (req.session.access_token !== undefined) {
        updateDb(req.session.userId, req.session.access_token)
            .then(() => {
                res.end();
            })
            .catch(error => {
                console.error("Error in update -> " + error);
                res.end();
            });
    }

});

app.get('/', async (req, res) => {
    if (req.session.logged) {

        res.render('index', {
            username: req.session.username,
            token: req.session.access_token
        });
    } else {
        res.render('index_login', {});
    }
});



app.listen(8080);