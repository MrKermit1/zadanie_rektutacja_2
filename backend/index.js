const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

const dbInfo = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
};



const db = mysql.createPool(dbInfo);

function isItString(value) {
    return typeof value === "string";
}

function isItNumber(value) {
    return typeof value === "number";
}

function isStringEmpty(value) {
    if (isItString(value)) {
        return value.trim().length === 0;
    }
    return false;
}

app.get("/getPlayers", (req, res) => {
    var query = "SELECT * FROM player";

    db.query(
        query,
        [],
        (err, result) => {
            if (err) {
                return console.log(err);
            }

            if (result.length == 0) {
                return res.status(409).send("Nie wczytano danych (pusta tabela).");    
            }else {
                res.status(200).json(result);
            }
        } 
    );
});

app.post("/getPlayerByEmail", (req, res) => {
    var query = "SELECT * FROM player WHERE email = ?";
    var email = req.body.email; 

    db.query(
        query,
        [],
        (err, result) => {
            if (err) {
                return console.log(err);
            }

            if (result.length == 0) {
                return res.status(409).send("Nie wczytano danych (pusta tabela).");    
            }else {
                res.status(200).json(result);
            }
        } 
    );
});

app.post("/createPlayer", (req, res) => {
    var query1 = "INSERT INTO player (nick, email, poziom) VALUES (?, ?, ?)";
    var query2 = "SELECT * FROM player WHERE email = ? OR nick = ?";

    const nick = req.body.nick;
    const email = req.body.email;
    const poziom = parseInt(req.body.poziom);

    if (isStringEmpty(nick) || isStringEmpty(email)) {
        return res.status(409).send("Wprowadzoną pustą wartość!");
    }

    if (poziom < 0) {
        return res.status(409).send("Wartość poziomu nie może być ujemna!");
    }

    if (!isItNumber(poziom)) {
        return res.status(409).send("Wartość poziomu powinna być liczbą!");
    }

    db.query(
        query2,
        [email, nick],
        (err, result) => {
            if (err) {
                return console.log(err);
            }else {
                if (result.length > 0) {
                    return res.status(409).send("Taki gracz już istnieje!");
                }

                db.query(
                    query1,
                    [nick, email, poziom],
                    (err, result) => {
                        if (err) {
                            return console.log(err);
                        }

                        res.status(200).send("Dodano gracza.")
                    }
                );
            }
        }
    );
});

app.post("/updatePlayer", (req, res) => {
    var query = "UPDATE player SET nick = ?, email = ?, poziom = ? WHERE id = ?"
    const nick = req.body.nick;
    const email = req.body.email;
    const poziom = parseInt(req.body.poziom);
    const id = parseInt(req.body.id);

    if (isStringEmpty(nick) || isStringEmpty(email)) {
        return res.status(409).send("Wprowadzoną pustą wartość!");
    }

    if (poziom < 0) {
        return res.status(409).send("Wartość poziomu nie może być ujemna!");
    }

    if (!isItNumber(poziom)) {
        return res.status(409).send("Wartość poziomu powinna być liczbą!");
    }

    if (!isItNumber(id)) {
        return res.status(409).send("Wartość id powinna być liczbą!");
    }

    if (id < 1) {
        return res.status(409).send("Wartość id nie może być mniejsza niż 1!");
    }

    db.query(
        query,
        [nick, email, poziom, id],
        (err, result) => {
            if (err) {
                return console.log(err);
            }
            res.status(200).send("Zaaktualizowano gracza");
        }
    );
});

app.post("/deletePlayer", (req, res) => {
    var query = "DELETE FROM player WHERE id = ?";
    const id = req.body.id;

    db.query(
        query,
        [id],
        (err, result) => {
            if (err) {
                return console.log(err);
            }

            res.status(200).send("Usunięto gracza");
        }  
    );
});

app.listen(PORT, () => {
    console.log(`serwer działa na porcie ${[PORT]}`);
})