// server.js - Express server with MySQL database

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "book_collection",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");

  // Create books table if it doesn't exist
  db.query(
    `
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      year INT NOT NULL,
      genre VARCHAR(100) NOT NULL
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating books table:", err);
      } else {
        console.log("Books table ready");
      }
    }
  );
});

// API Routes

// Get all books
app.get("/api/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a single book
app.get("/api/books/:id", (req, res) => {
  db.query(
    "SELECT * FROM books WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(results[0]);
    }
  );
});

// Create a new book
app.post("/api/books", (req, res) => {
  const { title, author, year, genre } = req.body;

  if (!title || !author || !year || !genre) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    "INSERT INTO books (title, author, year, genre) VALUES (?, ?, ?, ?)",
    [title, author, year, genre],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.query(
        "SELECT * FROM books WHERE id = ?",
        [result.insertId],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json(rows[0]);
        }
      );
    }
  );
});

// Update a book
app.put("/api/books/:id", (req, res) => {
  const { title, author, year, genre } = req.body;

  if (!title || !author || !year || !genre) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    "UPDATE books SET title = ?, author = ?, year = ?, genre = ? WHERE id = ?",
    [title, author, year, genre, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Book not found" });
      }

      db.query(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json(rows[0]);
        }
      );
    }
  );
});

// Delete a book
app.delete("/api/books/:id", (req, res) => {
  db.query("DELETE FROM books WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: `Book with ID ${req.params.id} deleted` });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
