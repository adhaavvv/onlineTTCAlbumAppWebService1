// include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

//database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

//initialize Express app
const app = express();
//helps app to read JSON
app.use(express.json());

//start the server
app.listen(port, () => {
    console.log('Server running on port', port);
});

app.get('/allalbums', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.tyler_the_creator_albums');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for allalbums'});
    }
});

app.post('/addalbum', async (req, res) => {
    const { album_name, album_cover_art } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO tyler_the_creator_albums (album_name, album_cover_art) VALUES (?, ?)', [album_name, album_cover_art]);
        res.status(201).json({ message: album_name+' album added successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not add '+album_name+' album' });
    }
});

app.put('/updatealbum/:id', async (req, res) => {
    const { album_name, album_cover_art } = req.body;
    const id = req.params.id;

    try {
        let connection = await mysql.createConnection(dbConfig);

        const sql = `
            UPDATE tyler_the_creator_albums
            SET album_name = ?, album_cover_art = ?
            WHERE id = ?
        `;

        const [result] = await connection.execute(sql, [
            album_name,
            album_cover_art,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Album not found' });
        }

        res.json({ message: album_name+' album updated successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update album' });
    }
});




