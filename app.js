const express = require('express');
const path = require('path');
const db = require('./util/database'); // Import your database connection

const app = express();

app.use(express.static(path.join(__dirname, 'view')));

app.get('/api/cities', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM city');
        res.json(rows);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Unable to load city data.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});