const jwt = require("jsonwebtoken"); // JWT token oluşturmak ve doğrulamak için
const db = require("../db"); // Veritabanı bağlantısı
require("dotenv").config(); // .env dosyasındaki çevresel değişkenleri kullanmak için

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // JWT token oluştur
        const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        return res.status(200).json({ message: "Login successful", token, userId: user.id, email });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Register User
const registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const [result] = await db.query("INSERT INTO users (email, password, username) VALUES (?, ?, ?)", [
            email,
            password,
            username,
        ]);

        return res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { loginUser, registerUser };
