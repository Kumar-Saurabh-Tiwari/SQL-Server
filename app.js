const express = require('express');
const path = require('path');
const db = require('./util/database'); // Import your database connection
const userRoutes = require('./routes/users');
const busRoutes = require('./routes/buses');

const app = express();

app.use(express.json());
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

app.use('/api/users', userRoutes);
app.use('/api/buses', busRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body must contain valid JSON.' });
    }

    return next(error);
});

if (require.main === module) {
    const port = Number(process.env.PORT || 3000);
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    const shutdown = () => {
        server.close(() => {
            db.end()
                .then(() => process.exit(0))
                .catch((error) => {
                    console.error('Failed to close the database pool:', error);
                    process.exit(1);
                });
        });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}

module.exports = app;