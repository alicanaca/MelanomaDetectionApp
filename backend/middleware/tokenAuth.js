const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied" });
    }

    // 'Bearer <token>' formatını ayır ve sadece token'ı al
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); // Burada doğru SECRET_KEY kullanıldığından emin olun
        req.user = verified; // Doğrulanmış kullanıcı bilgilerini req.user içine koy
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

module.exports = authenticateToken;
