const express = require('express');
const router = express.Router();

const db = require('../src/db');


router.get('/join', (req, res) => {
    if (req.session.logged) {
        res.redirect('/');
        return;
    }

    // Tell to pug if when redirection on bad user info
    res.render('join', {});
});

router.post('/join', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    
    db.addUser(username, password)
        .then(() => {
            return db.getUser(username, password);
        })
        .then(result => {
            req.session.logged = true;
            req.userId = result[0].id;
            req.session.username = username;
    
            res.redirect('/');
        })
        .catch(error => {
            req.flash("error", error);
            res.redirect('/join');
        });
});


router.get('/login', (req, res) => {
    if (req.session.logged) {
        res.redirect('/');
        return;
    }

    res.render('login', {});
});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.getUser(username, password)
        .then(result => {
            req.session.logged = true;
            req.session.userId = result[0].id;
            req.session.username = username;

            res.redirect('/');
        })
        .catch(error => {
            req.flash("error", error);
            res.redirect('/login');
        });
});

module.exports = router;