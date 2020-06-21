const express = require("express");
const axios = require("axios");
const qs = require("qs");


const clientId     = require('../secret').clientId;
const clientSecret = require('../secret').clientSecret;
const oauthUri     = "http://localhost:8080/oauth/token";


const router = express.Router();


router.get("/oauth/redirect", (req, res) => {
    let scope = "read_logged_time,read_stats";

    res.redirect(`https://wakatime.com/oauth/authorize/?client_id=${clientId}&response_type=code&redirect_uri=${oauthUri}&scope=${scope}`)
});


router.get("/oauth/token", (req, res) => {
    const userCode = req.query.code;
    
    axios.post(
        'https://wakatime.com/oauth/token',
        qs.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: oauthUri,
            grant_type: "authorization_code",
            code: userCode
        })
    )
    
    .then(response => {
        req.session.access_token = response.data.access_token;

        res.redirect('/');
    })
    
    .catch(error => {
        console.log("Error from wakatime -> " + error);
        console.log(error.response.data);
    });
});

module.exports = router;