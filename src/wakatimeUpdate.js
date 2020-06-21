const axios = require('axios');
const db = require('./db');

function parseSummarie(data) {
    let userData = {};

    for (const day of data.data) {
        const date = day.range.date;
        userData[date] = {};

        for (const categorie of day.categories) {
            if (categorie.name !== 'Coding') {
                continue;
            }

            userData[date].totalTime = categorie.digital;
        }

        // Skip empty days
        if (userData[date].totalTime === undefined) {
            userData[date].totalTime = null;
            userData[date].languages = null;
            userData[date].projects  = null;

            continue;
        }
        
        
        userData[date].languages = {};
        for (const language of day.languages) {
            userData[date].languages[language.name] = language.digital;
        }

        userData[date].projects = {};
        for (const project of day.projects) {
            userData[date].projects[project.name] = project.digital;
        }
    }

    return userData;
}

// TODO : Stocker les infos dans bdd: Id | Date | Data. Penser à mettre à jour lastUpdate dans BDD && cookie.

module.exports = async function update(userId, token) {
    let lastUpdate;

    await db.getLastUpdate(userId).then(result => {
        lastUpdate = result[0].lastUpdate;
    }) .catch(err => {
        throw err;
    });
    
    console.log(`Last update for userId ${userId} -> ${lastUpdate}`);

    
    let startTime = lastUpdate;
    
    if (startTime == null) {
        let d = new Date();
        d.setDate(d.getDate() - 14); // Wakatime free offer is 14days 
        
        startTime = d.toISOString().split('T')[0];
    }

    let endTime = (new Date()).toISOString().split('T')[0];


    console.log(`Start -> ${startTime}, to End -> ${endTime}`);

    const baseUrl = 'https://wakatime.com/api/v1/users/current/';
    let summarieUrl = baseUrl + `summaries?start=${startTime}&end=${endTime}`

    return new Promise((resolve, reject) => {
        axios.get(summarieUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            console.log("Response from wakatime update !")

            const result = parseSummarie(response.data);
            console.log(JSON.stringify(result, null, 4));
           

            resolve();
        }).catch(error => {
            reject(error);
        });
    });   
}