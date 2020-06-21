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


function insertSummaries(userId, summaries, lastUpdate) {
    for (const date in summaries) {
        db.insertSummarie(userId, date, summaries[date], lastUpdate)
            .catch(error => {
                console.error("Error in insertSummaries -> " + error);
            });
    }
}


module.exports = async function update(userId, token) {
    let lastUpdate;

    await db.getLastUpdate(userId).then(result => {
        lastUpdate = result[0].lastUpdate;

        if (lastUpdate != null) {
            let m = lastUpdate.getMonth() + 1;
            let d = lastUpdate.getDate();
            lastUpdate = `${lastUpdate.getFullYear()}-${m<10?'0'+m:m}-${d<10?'0'+d:d}`
        }
    }) .catch(err => {
        throw err;
    });

    let startTime = lastUpdate;
    
    if (startTime == null) {
        let d = new Date();
        d.setDate(d.getDate() - 14); // Wakatime free offer is 14days 
        
        startTime = d.toISOString().split('T')[0];
    }

    let endTime = (new Date()).toISOString().split('T')[0];


    const baseUrl = 'https://wakatime.com/api/v1/users/current/';
    let summarieUrl = baseUrl + `summaries?start=${startTime}&end=${endTime}`

    return new Promise((resolve, reject) => {
        axios.get(summarieUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            const result = parseSummarie(response.data);
           
            insertSummaries(userId, result, lastUpdate);
            db.setLastUpdate(userId, endTime)
                .catch(error => console.error("Error in setLastUpdate -> " + error));

            resolve();
        }).catch(error => {
            reject(error);
        });
    });   
}