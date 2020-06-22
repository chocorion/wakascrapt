const mysql = require('mysql');

function basicDbCallback(resolve, reject) {
    return (error, result) => {
        if (error) reject(error);
        else resolve(result);
    }
}
 

class dbManager {
    constructor() {
        this.connection = mysql.createConnection({
            host:       require('../secret').databaseHost,
            user:       require('../secret').databaseUser,
            database:   require('../secret').databaseName
        });

        this.connection.connect(err => {
            if (err) throw err;
            console.log("Connected to db !");
        });
    }

    _basicQuery(query) {
        return new Promise((resolve, reject) => {
            this.connection.query(
                query,
                basicDbCallback(resolve, reject)
            );
        });
    }

    // TODO : Use hash version for the password !
    addUser(username, password) {
        const query = `INSERT INTO users (name, password) VALUES("${username}", "${password}")`;
        
        return this._basicQuery(query);
    }


    getUser(username, password) {
        const query = `SELECT id FROM users WHERE name="${username}" AND password="${password}"`;

        return new Promise((resolve, reject) => {
            this.connection.query(
                query,
                (error, result) => {
                    if (error) reject(error);                
                    
                    if (!result.length) {
                        reject("Invalid username or password");
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }


    getLastUpdate(userId) {
        const query = `SELECT lastUpdate FROM users WHERE id=${userId}`;
        
        return this._basicQuery(query);
    }

    setLastUpdate(userId, date) {
        const query = `UPDATE users SET lastUpdate = '${date}' WHERE id=${userId}`;

        return this._basicQuery(query);
    }


    insertSummarie(userId, date, data, lastUpdate) {
        let query;
 
        if (date == lastUpdate) {
            query = `UPDATE userData SET data = '${JSON.stringify(data)}' WHERE userId=${userId} AND date='${date}'`;    
        } else {
            query = `INSERT INTO userData (userId, date, data) VALUES(${userId}, '${date}', '${JSON.stringify(data)}')`;
        }
        
        return this._basicQuery(query);
    }


    getSummarie(userId, date) {
        const query = `SELECT data FROM userData WHERE userId=${userId} AND date='${date}'`;

        return this._basicQuery(query);
    }


    end() {
        this.connection.end();
    }
}

const instance = new dbManager();
Object.freeze(instance);

module.exports = instance;