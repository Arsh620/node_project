require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool using environment variables
const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
});

// Export the pool for use in other files
module.exports = {
    query: (text, params) => pool.query(text, params), // Helper to run queries
    pool, // Direct access to the pool
};
