const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/profile", profileRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
