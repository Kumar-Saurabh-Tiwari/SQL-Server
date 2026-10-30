const express = require('express');
const db = require('../util/database');

const router = express.Router();

const USER_FIELDS = 'id, name, email';

function parseUserId(value) {
    if (!/^[1-9]\d*$/.test(value)) {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
}

function validateUserInput(body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return {
            error: 'name and a valid email are required.'
        };
    }

    return { name, email };
}

function sendDatabaseError(res, error, operation) {
    console.error(`User ${operation} failed:`, error);

    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A user with that email already exists.' });
    }

    return res.status(500).json({ error: `Unable to ${operation} user.` });
}

router.post('/', async (req, res) => {
    const user = validateUserInput(req.body || {});
    if (user.error) {
        return res.status(400).json({ error: user.error });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO Users (name, email) VALUES (?, ?)',
            [user.name, user.email]
        );
        const [rows] = await db.execute(
            `SELECT ${USER_FIELDS} FROM Users WHERE id = ?`,
            [result.insertId]
        );

        console.log(`User inserted: id=${result.insertId}, name="${user.name}", email="${user.email}"`);
        return res.status(201).json(rows[0]);
    } catch (error) {
        return sendDatabaseError(res, error, 'insert');
    }
});

async function updateUser(req, res) {
    const id = parseUserId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'User id must be a positive integer.' });
    }

    const user = validateUserInput(req.body || {});
    if (user.error) {
        return res.status(400).json({ error: user.error });
    }

    try {
        await db.execute(
            'UPDATE Users SET name = ?, email = ? WHERE id = ?',
            [user.name, user.email, id]
        );
        const [rows] = await db.execute(
            `SELECT ${USER_FIELDS} FROM Users WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            console.error(`User update skipped: id=${id} was not found`);
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log(`User updated: id=${id}, name="${user.name}", email="${user.email}"`);
        return res.json(rows[0]);
    } catch (error) {
        return sendDatabaseError(res, error, 'update');
    }
}

router.put('/:id', updateUser);
router.patch('/:id', updateUser);

router.delete('/:id', async (req, res) => {
    const id = parseUserId(req.params.id);
    if (id === null) {
        return res.status(400).json({ error: 'User id must be a positive integer.' });
    }

    try {
        const [result] = await db.execute('DELETE FROM Users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            console.error(`User deletion skipped: id=${id} was not found`);
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log(`User deleted: id=${id}`);
        return res.status(204).send();
    } catch (error) {
        return sendDatabaseError(res, error, 'delete');
    }
});

module.exports = router;
