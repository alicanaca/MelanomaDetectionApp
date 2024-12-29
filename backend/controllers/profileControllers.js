const db = require("../db");

const getUserProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { getUserProfile };