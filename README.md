# SQL Cities Dashboard

A simple Express and MySQL application that reads city data from a SQL database and displays it in a clean browser dashboard.

The application:

- Connects to MySQL using a connection pool.
- Loads city records from the `city` table in the `world` database.
- Provides parameterized CRUD endpoints for records in the `Users` table.
- Provides endpoints for inserting buses and filtering them by available seats.
- Serves a browser-based dashboard from the `view` folder.
- Displays city name, country code, district, and population.
- Shows total cities, countries, and population statistics.
- Supports searching and sorting city records.
- Displays whether the SQL database connection is working.

## Requirements

Install the following before running the application:

- [Node.js](https://nodejs.org/) 18 or newer
- npm
- MySQL Server
- A MySQL database containing a `city` table

The default configuration expects the sample MySQL `world` database. The `city` table should contain columns similar to:

| Column | Description |
|---|---|
| `ID` | Unique city identifier |
| `Name` | City name |
| `CountryCode` | Three-letter country code |
| `District` | State, province, or district |
| `Population` | City population |

## Installation

1. Open a terminal in the project directory.

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create the local environment file:

   ```bash
   copy .env.example .env
   ```

   On macOS or Linux, use:

   ```bash
   cp .env.example .env
   ```

4. Open `.env` and set your MySQL connection details:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_database_password
   DB_NAME=world
   ```

   Do not commit `.env` to source control. It is already included in `.gitignore`.

## Running the application

Start the server with:

```bash
node app.js
```

When the server starts successfully, it listens on:

```text
http://localhost:3000
```

Open that address in a browser to view the dashboard.

## Application routes

### `GET /`

Serves the dashboard interface from `view/index.html`.

### `GET /api/cities`

Queries the MySQL `city` table and returns the records as JSON.

Example response:

```json
[
  {
    "ID": 1,
    "Name": "Kabul",
    "CountryCode": "AFG",
    "District": "Kabol",
    "Population": 1780000
  }
]
```

If the database query fails, the endpoint returns HTTP `500` with:

```json
{
  "error": "Unable to load city data."
}
```

### User CRUD endpoints

The user endpoints use JSON request bodies with `name` and `email` fields:

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/users` | Insert a new user |
| `PUT` | `/api/users/:id` | Update an existing user |
| `PATCH` | `/api/users/:id` | Update an existing user |
| `DELETE` | `/api/users/:id` | Delete a user |

Successful insertion returns `201` and the created record. Updates return `200`,
deletions return `204`, invalid input returns `400`, and updating or deleting a
non-existent user returns `404`. Database failures are logged on the server and
return `500` without exposing database details to clients.

### User and bus data endpoints

The sample data in [`sample-data.sql`](./sample-data.sql) inserts users, buses,
bookings, and payments, and includes the raw SQL queries for retrieving users
and buses with more than 10 available seats.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/users` | Insert a user with `name` and `email` |
| `GET` | `/api/users` | Retrieve all users |
| `POST` | `/api/buses` | Insert a bus with `busNumber`, `totalSeats`, and `availableSeats` |
| `GET` | `/api/buses/available/:seats` | Retrieve buses with more than `:seats` available seats |

Example bus request:

```json
{
  "busNumber": "DL01AB1234",
  "totalSeats": 40,
  "availableSeats": 25
}
```

For the required availability check, request
`GET /api/buses/available/10`.

## Dashboard features

- **SQL database heading** clearly indicates that records are fetched from SQL.
- **SQL connected status** appears when the API successfully loads data.
- **SQL not connected status** appears when the API request fails.
- Summary cards show total cities, countries represented, and total population.
- Search filters by city name, country code, or district.
- Table headers can be used to sort the results.
- Population values are formatted with thousands separators.
- The layout adjusts for smaller screens.

## Project structure

```text
SQL-Server/
├── app.js                  # Express server and API routes
├── package.json            # Node.js dependencies
├── package-lock.json       # Locked dependency versions
├── .env                    # Local database credentials; do not commit
├── .env.example            # Environment variable template
├── .gitignore              # Ignored files and folders
├── routes/
│   ├── users.js            # User insertion, retrieval, update, and deletion endpoints
│   └── buses.js            # Bus insertion and seat-availability endpoints
├── sample-data.sql         # Sample users, buses, bookings, payments, and queries
├── util/
│   └── database.js         # MySQL connection pool
└── view/
    ├── index.html          # Dashboard markup
    ├── styles.css          # Dashboard styling
    └── app.js              # Search, sorting, rendering, and API loading
```

## Database configuration

Database configuration is loaded by `dotenv` in `util/database.js`. The application uses:

```js
mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
});
```

Keeping these values in `.env` prevents credentials from being hardcoded in the source files. Use different credentials for development, staging, and production. The application reuses a bounded connection pool and closes it during graceful shutdown to avoid connection leaks.

## Troubleshooting

### The dashboard says “SQL not connected”

Check the following:

1. MySQL Server is running.
2. The values in `.env` are correct.
3. The configured database exists.
4. The `city` table exists.
5. The MySQL user has permission to read the database.
6. Port `3306` is available or `DB_PORT` matches your MySQL port.

The server terminal logs the database query error for troubleshooting.

### The browser cannot connect to `localhost:3000`

Make sure the server is running:

```bash
node app.js
```

Also verify that another application is not already using port `3000`.

### Environment values are not loading

Confirm that:

- The file is named exactly `.env`.
- It is located in the project root next to `app.js`.
- Each variable uses the `KEY=value` format.
- The server was restarted after changing `.env`.

## Security notes

- Never commit `.env` or expose its contents in screenshots, logs, or source code.
- Use a MySQL user with only the permissions required by this application.
- Use a strong database password.
- Store production secrets in the hosting provider's secret or environment-variable manager.
- Do not use the development database password in production.

## Validation

Validate the JavaScript files with:

```bash
node --check app.js
node --check view/app.js
```

Then start the server and open `http://localhost:3000` to verify the complete application flow.
