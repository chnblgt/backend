const express = require('express');
const app = express();

const PORT = 8000;

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
    console.log("mail ->", email, "password -->",  password);
    
    res.send("hereglech uusle");
})

app.get("/getUser", (req, res) => {
    const {email, password, matchPassword} = req.query;

    if(password === matchPassword) {
        res.send({ message: "password taarahgui baina"});
    }

    if(email == undefined)  {
        res.status(400).send({
            message: "email oldsongui",
            success: false
        });
        return;
    }

    if(email === "temvjin@gmail.com"){ 
        res.send({ message: "medeelel irlee",email: email, name: "Temvjin", age: 25});
        return;
    } else {
        res.status(400).send("amjiltgui");
    }
    console.log("mail ->", email);
    
    res.send({ message: "hereglechiin medeelel amjilltai irle",email: email});
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});