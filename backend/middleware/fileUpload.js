const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper function to create directory if it doesn't exist
const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.query.userId; // Kullanıcı ID'sini alıyoruz
        if (!userId) {
            console.log(userId);
            return cb(new Error("User ID is required to save the file"), null);
        }

        const userDir = path.join("uploads", userId); // uploads/userId
        ensureDirectoryExistence(userDir); // Klasörü oluştur
        cb(null, userDir); // Dosya bu klasöre kaydedilecek
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const formattedTime = `${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
        const fileName = `${formattedDate}_${formattedTime}_${file.originalname}`;
        cb(null, fileName); // Örnek: 2024-12-27_14-30-00_photo.jpg
    },
});

const upload = multer({ storage });

module.exports = upload;
