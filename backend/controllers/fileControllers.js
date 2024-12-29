const db = require("../db");
const path = require("path");
const { exec } = require("child_process");

const fileUpload = async (req, res) => {
    const { userId } = req.body; // Kullanıcı ID'si frontend'den gönderilecek
    const imagePath = req.file.path; // Dosya yolu

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const analyzeScriptPath = path.join(
        "C:",
        "Users",
        "alica",
        "Desktop",
        "MelanomaModel",
        "analyze.py"
    );
    const venvPythonPath = path.join(
        "C:",
        "Users",
        "alica",
        "Desktop",
        "MelanomaModel",
        "venv",
        "Scripts",
        "python.exe"
    ); // Virtual environment'ın Python yürütücüsü

    exec(
        `"${venvPythonPath}" "${analyzeScriptPath}" "${path.resolve(imagePath)}"`,
        async (error, stdout, stderr) => {
            if (error) {
                console.error(`Python error: ${stderr}`);
                return res.status(500).json({ error: "Analysis failed" });
            }

            console.log(`Full Python stdout: [${stdout}]`); // Python çıktısını loglayın

            try {
                // Satırlara göre çıktıyı böl
                const outputLines = stdout.trim().split(/\r?\n/);

                const predictionLine = outputLines.find((line) =>
                    line.includes("Prediction:")
                );
                const confidenceLine = outputLines.find((line) =>
                    line.includes("Confidence:")
                );

                // Prediction ve Confidence değerlerini çıkar
                const binaryPrediction = predictionLine
                    ? parseInt(predictionLine.split("Prediction:")[1].trim())
                    : null;

                const confidence = 1 - (confidenceLine
                    ? parseFloat(confidenceLine.split("Confidence:")[1].trim())
                    : null);

                // Prediction veya confidence eksikse hata döndür
                if (binaryPrediction === null || confidence === null) {
                    console.error("Invalid Python output:", stdout);
                    return res.status(500).json({ error: "Invalid analysis result" });
                }

                const query = `
                INSERT INTO analyses (user_id, image_path, prediction, confidence)
                VALUES (?, ?, ?, ?)
            `;
                await db.query(query, [
                    userId,
                    imagePath,
                    parseInt(binaryPrediction),
                    confidence,
                ]);

                return res.status(200).json({
                    message: "Analysis completed",
                    prediction: binaryPrediction,
                    confidence: confidence,
                });
            } catch (dbError) {
                console.error(`Database error: ${dbError.message}`);
                return res.status(500).json({ error: "Database error" });
            }
        }
    );
};

const getAnalyses = async (req, res) => {
    const userId = req.params.userId || req.query.userId || req.body.userId;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const [rows] = await db.query(
            "SELECT * FROM analyses WHERE user_id = ?",
            [userId]
        );

        rows.forEach(row => {
            row.image_path = path.basename(row.image_path);
        });

        if (rows.length === 0) {
            return res.status(200).json({ message: "No analyses yet!" });
        }

        return res.status(200).json({ analyses: rows });
    } catch (error) {
        console.error(`Database error: ${error.message}`);
        return res.status(500).json({ error: "Database error" });
    }
};

const deleteAnalysis = async (req, res) => {
    const analysisId = req.params.id;

    if (!analysisId) {
        return res.status(400).json({ error: "Analysis ID is required" });
    }

    try {
        const [rows] = await db.query(
            "DELETE FROM analyses WHERE id = ?",
            [analysisId]
        );

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: "Analysis not found" });
        }

        return res.status(200).json({ message: "Analysis deleted" });
    } catch (error) {
        console.error(`Database error: ${error.message}`);
        return res.status(500).json({ error: "Database error" });
    }
}

module.exports = { fileUpload, getAnalyses, deleteAnalysis };
