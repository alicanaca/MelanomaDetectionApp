const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload");
const { fileUpload, getAnalyses, deleteAnalysis } = require("../controllers/fileControllers");

// Fotoğraf yükleme ve kullanıcıya bağlama
router.post("/upload", upload.single("image"), fileUpload);
router.get("/analyses", getAnalyses);
router.delete("/delete/:id", deleteAnalysis);

module.exports = router;