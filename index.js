const express = require('express');
const mysql = require('mysql2');
const app = express();

const PORT = 8000;
const db = new mysql.createConnection({
    host : "localhost",
    password : "admin123",
    user : "root",
    database : "duguilan_mn"
});
db.connect((err) =>{
    if(err){
        console.log("Database holbogdsongu")
    }else {
        console.log("Database holbogdlo")
    }
});
app.use(express.json());

app.get('/', (req, res) => {
  res.send('server ajillaj baina!');
});

app.post("/createUser", (req, res) => {
    const {email, password, passwordMatch} = req.body;

    if(password !== passwordMatch) {
        res.status(400).send({
            message: "password taarahgui baina",
            success: false
        });
        return;
    }

    if(password == undefined || email == undefined)  {
        res.status(400).send({
            message: "medeelel dutuu oruulah ystoi",
            success: false
        });
        return;
    }

    const query = "INSERT INTO users (email, password) VALUES (?, ?)";

    db.query(query, [email, password], (err, result) => {
        if(err){
            console.log(err);
            res.status(500).send("datand aldaa garlaa");
            return;
        }

        res.send({
            message: "hereglech amjilttai uuslee",
            success: true
        });
    });
});

app.get("/getUser", (req, res) => {
    const {email} = req.query;

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], (err, result) => {
        if(err){
            res.status(500).send("datand aldaa garlaa");
            return;
        }

        if(result.length === 0){
            res.status(404).send("user oldsongui");
            return;
        }

        res.send(result[0]);
    });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});