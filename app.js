const express = require('express');
const { Client } = require('pg'); // Import the pg module
const cors = require('cors');  // Import CORS package

const app = express();
const port = 3000;

// Enable CORS to allow requests from different origins
app.use(cors());

// Enable JSON request body parsing
app.use(express.json());

// PostgreSQL database connection configuration
const db = new Client({
  host: "dpg-cvn747bipnbc73d25080-a.oregon-postgres.render.com",
  port: 5432,
  user: "rncoursefeng37_user",
  password: "1b8AQoyVtIff8pUGS8by1x1yPV1gxQjT",
  database: "rncoursefeng37",
  ssl: { rejectUnauthorized: false }, // Enable SSL
});

// Connect to PostgreSQL database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to PostgreSQL database");
});

// LoadData endpoint
app.post('/LoadData', (req, res) => {
  const { userName } = req.body;

  if (!userName) {
    return res.json({ success: false, message: 'User name is required' });
  }

  const checkUserSql = 'SELECT * FROM bankdata WHERE "userName" = $1';
  db.query(checkUserSql, [userName], (err, result) => {
    if (err) {
      return res.json({ success: false, message: 'Database error' });
    }

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return res.json({
        success: true,
        userName: row.userName,
        bankSavings: [
          row.bank0,
          row.bank1,
          row.bank2,
          row.bank3,
          row.bank4,
          row.bank5,
          row.bank6,
          row.bank7,
          row.bank8,
          row.bank9,
        ],
      });
    } else {
      return res.json({ success: false, message: 'User not found' });
    }
  });
});

// SaveData endpoint
app.post('/SaveData', (req, res) => {
  const { userName, bankSavings } = req.body;

  if (!userName || !Array.isArray(bankSavings)) {
    return res.json({ success: false, message: 'Invalid data' });
  }

  const checkUserSql = 'SELECT * FROM bankdata WHERE "userName" = $1';
  db.query(checkUserSql, [userName], (err, result) => {
    if (err) {
      return res.json({ success: false, message: 'Database error' });
    }

    if (result.rows.length > 0) {
      const updateSql = `UPDATE bankdata SET 
                          bank0 = $1, bank1 = $2, bank2 = $3, bank3 = $4, bank4 = $5, 
                          bank5 = $6, bank6 = $7, bank7 = $8, bank8 = $9, bank9 = $10
                          WHERE "userName" = $11`;

      db.query(updateSql, [
        ...bankSavings,
        userName,
      ], (err, result) => {
        if (err) {
          return res.json({ success: false, message: 'Failed to update data' });
        }
        return res.json({ success: true, message: 'Data updated successfully' });
      });
    } else {
      const insertSql = `INSERT INTO bankdata ("userName", bank0, bank1, bank2, bank3, bank4, bank5, bank6, bank7, bank8, bank9) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

      db.query(insertSql, [
        userName,
        ...bankSavings,
      ], (err, result) => {
        if (err) {
          return res.json({ success: false, message: 'Failed to insert data' });
        }
        return res.json({ success: true, message: 'Data inserted successfully' });
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
