const axios = require('axios');
const db = require('./db');

/**
 * Take data from wakatime, and extract interesting data .
 * @param {Object} data Data from wakatime API.
 * 
 * @returns {Object} Extracted data.
 */
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


/**
 * 
 * @param {Number} userId Id of the current user.
 * @param {Object} summaries Summaries to store, by date.
 * @param {Date (iso format)} lastUpdate Date of the last update for the current user.
 */
function insertSummaries(userId, summaries, lastUpdate) {
    for (const date in summaries) {
        db.insertSummarie(userId, date, summaries[date], lastUpdate)
            .catch(error => {
                console.error("Error in insertSummaries -> " + error);
            });
    }
}


/**
 * Update data from wakatime for the given user.
 * @param {Number} userId 
 * @param {String} token 
 */
async function update(userId, token) {
    let lastUpdate;

    await db.getLastUpdate(userId)
        .then(result => {
            lastUpdate = result[0].lastUpdate;

            if (lastUpdate != null) {
                let d = lastUpdate.getDate();
                let m = lastUpdate.getMonth() + 1;
                let y = lastUpdate.getFullYear();

                // Problem with timezone on toIsoString...
                lastUpdate = `${y}-${m<10?'0'+m:m}-${d<10?'0'+d:d}`
            }
        }) 
        .catch(err => {throw err;});

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
        })
            .then(response => {
                const result = parseSummarie(response.data);
                
                insertSummaries(userId, result, lastUpdate);
                db.setLastUpdate(userId, endTime)

                resolve();
            })
            .catch(error => reject(error));
    });   
}

module.exports = update;