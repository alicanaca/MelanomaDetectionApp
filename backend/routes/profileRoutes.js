const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controllers/profileControllers");
const authenticateToken = require("../middleware/tokenAuth");

// Routes
router.get("/:userId", authenticateToken, getUserProfile);

module.exports = router;