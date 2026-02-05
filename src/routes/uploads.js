const express = require("express");
const multer = require("multer");
const auth = require("../middlewares/auth");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Asegurarse de que la carpeta uploads exista
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

// Subir uno o varios archivos (autenticado)
router.post("/", auth, upload.array("files", 10), (req, res) => {
  try {
    const host = req.get("host");
    const proto = req.protocol;
    const files = req.files.map((f) => ({ url: `${proto}://${host}/uploads/${f.filename}`, filename: f.filename }));
    res.json({ files });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ msg: "Error subiendo archivos" });
  }
});

module.exports = router;
