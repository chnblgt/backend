const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server ажиллаж байна!');
});

app.post('/createUser', async (req, res) => {
    const { email, password, passwordMatch, username } = req.body;

    if (!email || !password || !passwordMatch || !username) {
        return res.status(400).send({
            message: "Мэдээлэл дутуу оруулах ёстой",
            success: false
        });
    }

    if (password !== passwordMatch) {
        return res.status(400).send({
            message: "Нууц үг таарахгүй байна",
            success: false
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";

    db.query(query, [email, username, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({
                    message: "Энэ имэйл аль хэдийн бүртгэлтэй байна",
                    success: false
                });
            }
            console.log(err);
            return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });
        }

        res.send({
            message: "Хэрэглэч амжилттай үүслээ",
            success: true,
            userId: result.insertId
        });
    });
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            message: "Имэйл болон нууц үг оруулна уу",
            success: false
        });
    }

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, result) => {
        if (err) return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });

        if (result.length === 0) {
            return res.status(404).send({
                message: "Имэйл эсвэл нууц үг буруу байна",
                success: false
            });
        }

        const user = result[0];
        const passwordOk = await bcrypt.compare(password, user.password);

        if (!passwordOk) {
            return res.status(401).send({
                message: "Имэйл эсвэл нууц үг буруу байна",
                success: false
            });
        }

        delete user.password;

        res.send({
            message: "Амжилттай нэвтэрлээ",
            success: true,
            user
        });
    });
});

app.get('/getUser', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).send({ message: "Имэйл оруулна уу", success: false });
    }

    const query = "SELECT id, email, username, name, bio, location, phone, created_at FROM users WHERE email = ?";

    db.query(query, [email], (err, result) => {
        if (err) return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });

        if (result.length === 0) {
            return res.status(404).send({ message: "Хэрэглэч олдсонгүй", success: false });
        }

        res.send({ success: true, user: result[0] });
    });
});

app.put('/updateUser/:id', (req, res) => {
    const { id } = req.params;
    const { name, bio, location, phone } = req.body;

    const query = "UPDATE users SET name = ?, bio = ?, location = ?, phone = ? WHERE id = ?";

    db.query(query, [name, bio, location, phone, id], (err, result) => {
        if (err) return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });

        res.send({ message: "Профайл шинэчлэгдлээ", success: true });
    });
});

app.get('/clubs', (req, res) => {
    const { category } = req.query;

    let query = "SELECT * FROM clubs WHERE approved = 1";
    let params = [];

    if (category) {
        query += " AND category = ?";
        params.push(category);
    }

    db.query(query, params, (err, result) => {
        if (err) return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });

        res.send({ success: true, clubs: result });
    });
});

app.get('/clubs/:id', (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM clubs WHERE id = ?";

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });

        if (result.length === 0) {
            return res.status(404).send({ message: "Клуб олдсонгүй", success: false });
        }

        res.send({ success: true, club: result[0] });
    });
});

app.post('/registerClub', (req, res) => {
    const { name, category, description, email, phone, website, address, district, pricingType, foundedYear } = req.body;

    if (!name || !category || !description || !email) {
        return res.status(400).send({
            message: "Клубын нэр, ангилал, тайлбар, имэйл заавал байх ёстой",
            success: false
        });
    }

    const query = `
        INSERT INTO clubs (name, category, description, email, phone, website, address, district, pricing_type, founded_year, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    db.query(query, [name, category, description, email, phone, website, address, district, pricingType, foundedYear], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });
        }

        res.send({
            message: "Клуб амжилттай илгээгдлээ. Хянан шалгасны дараа нийтлэгдэнэ.",
            success: true,
            clubId: result.insertId
        });
    });
});

app.post('/joinClub', (req, res) => {
    const { userId, clubId } = req.body;

    if (!userId || !clubId) {
        return res.status(400).send({ message: "userId болон clubId шаардлагатай", success: false });
    }

    const query = "INSERT INTO memberships (user_id, club_id) VALUES (?, ?)";

    db.query(query, [userId, clubId], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({ message: "Та аль хэдийн энэ клубт нэгдсэн байна", success: false });
            }
            return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });
        }

        res.send({ message: "Клубт амжилттай нэгдлээ", success: true });
    });
});

app.delete('/leaveClub', (req, res) => {
    const { userId, clubId } = req.body;

    const query = "DELETE FROM memberships WHERE user_id = ? AND club_id = ?";

    db.query(query, [userId, clubId], (err, result) => {
        if (err) return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });

        res.send({ message: "Клубаас гарлаа", success: true });
    });
});

app.get('/myClubs/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT clubs.* FROM clubs
        JOIN memberships ON clubs.id = memberships.club_id
        WHERE memberships.user_id = ?
    `;

    db.query(query, [userId], (err, result) => {
        if (err) return res.status(500).send({ message: "Датанд алдаа гарлаа", success: false });

        res.send({ success: true, clubs: result });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});