-- Run this after schema.sql to populate the booking database with sample data.
INSERT INTO Users (name, email) VALUES
    ('Aarav Sharma', 'aarav.sharma@example.com'),
    ('Priya Verma', 'priya.verma@example.com');

INSERT INTO Buses (busNumber, totalSeats, availableSeats) VALUES
    ('DL01AB1234', 40, 25),
    ('DL02CD5678', 36, 8),
    ('MH03EF9012', 50, 18);

INSERT INTO Bookings (seatNumber) VALUES
    (4),
    (12);

INSERT INTO Payments (amountPaid, paymentStatus) VALUES
    (450.00, 'PAID'),
    (650.00, 'PENDING');

-- Retrieve all users.
SELECT id, name, email
FROM Users;

-- Retrieve buses with more than 10 available seats.
SELECT id, busNumber, totalSeats, availableSeats
FROM Buses
WHERE availableSeats > 10;
