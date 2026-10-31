const express = require('express');
const db = require('../util/database');

const router = express.Router();

const BUS_FIELDS = 'id, busNumber, totalSeats, availableSeats';

function parseNonNegativeInteger(value) {
    if (!/^(0|[1-9]\d*)$/.test(value)) {
        return null;
    }

    const number = Number(value);
    return Number.isSafeInteger(number) ? number : null;
}

function validateBusInput(body) {
    const busNumber = typeof body.busNumber === 'string' ? body.busNumber.trim() : '';
    const totalSeats = parseNonNegativeInteger(String(body.totalSeats ?? ''));
    const availableSeats = parseNonNegativeInteger(String(body.availableSeats ?? ''));

    if (!busNumber || totalSeats === null || totalSeats === 0 || availableSeats === null) {
        return { error: 'busNumber, a positive totalSeats, and availableSeats are required.' };
    }

    if (availableSeats > totalSeats) {
        return { error: 'availableSeats cannot exceed totalSeats.' };
    }

    return { busNumber, totalSeats, availableSeats };
}

function sendDatabaseError(res, error, operation) {
    console.error(`Bus ${operation} failed:`, error);
    return res.status(500).json({ error: `Unable to ${operation} bus data.` });
}

router.post('/', async (req, res) => {
    const bus = validateBusInput(req.body || {});
    if (bus.error) {
        return res.status(400).json({ error: bus.error });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO Buses (busNumber, totalSeats, availableSeats) VALUES (?, ?, ?)',
            [bus.busNumber, bus.totalSeats, bus.availableSeats]
        );
        const [rows] = await db.execute(
            `SELECT ${BUS_FIELDS} FROM Buses WHERE id = ?`,
            [result.insertId]
        );

        return res.status(201).json(rows[0]);
    } catch (error) {
        return sendDatabaseError(res, error, 'insert');
    }
});

router.get('/available/:seats', async (req, res) => {
    const seats = parseNonNegativeInteger(req.params.seats);
    if (seats === null) {
        return res.status(400).json({ error: 'seats must be a non-negative integer.' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT ${BUS_FIELDS} FROM Buses WHERE availableSeats > ? ORDER BY availableSeats DESC`,
            [seats]
        );
        return res.json(rows);
    } catch (error) {
        return sendDatabaseError(res, error, 'fetch');
    }
});

module.exports = router;