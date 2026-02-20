const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/course");
const lessonRoutes = require("./routes/lesson");
const progressRoutes = require("./routes/progress");
const aiRoutes = require("./routes/ai");
const examRoutes = require("./routes/exam");
const mlRoutes = require("./routes/ml");
const examResultRoutes = require("./routes/examResult");

const app = express();

const corsOptions = process.env.FRONTEND_URL ? { origin: process.env.FRONTEND_URL } : {};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exam-results", examResultRoutes);
app.use("/api/ml", mlRoutes);

const uploadsRouter = require("./routes/uploads");
app.use("/api/uploads", uploadsRouter);

module.exports = app;