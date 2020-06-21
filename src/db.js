const mysql = require('mysql');

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

    addUser(username, password) {
        const query = `INSERT INTO users (name, password) VALUES("${username}", "${password}")`;
        
        return new Promise((resolve, reject) => {
            this.connection.query(
                query,
                (error, result, fields) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    getUser(username, password) {
        const query = `SELECT id FROM users WHERE name="${username}" AND password="${password}"`;

        return new Promise((resolve, reject) => {
            this.connection.query(
                query,
                (error, result, fields) => {
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
        
        return new Promise((resolve, reject) => {
            this.connection.query(
                query,
                (error, result, fields) => {
                    if (error) console.error("Error in getLastUpdate -> " + error);
    
                    if (!result.length) {
                        reject("Invalid user id")
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    end() {
        this.connection.end();
    }
}

const instance = new dbManager();
Object.freeze(instance);

module.exports = instance;