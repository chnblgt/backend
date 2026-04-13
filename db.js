const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin123",
    database: "duguilan_platform"
});

db.connect((err) => {
    if (err) {
        console.log("Database холбогдсонгүй:", err.message);
    } else {
        console.log("Database холбогдлоо ✓");
    }
});

module.exports = db;