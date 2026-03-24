const mysql = require('mysql2');

const db = new mysql.createConnection({
    host : "localhost",
    password : "admin123",
    user : "root",
    database : "duguilan_platform"
});
db.connect((err) =>{
    if(err){
        console.log("Database holbogdsongu")
    }else {
        console.log("Database holbogdlo")
    }
});

module.exports(db);