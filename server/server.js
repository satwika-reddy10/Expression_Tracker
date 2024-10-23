const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(
  "mongodb+srv://leela:leeladhari@cluster0.aokrg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const AnalysisSchema = new mongoose.Schema({
  sessionId: String,
  imageAnalysis: [
    {
      imagePath: String,
      emotions: {
        angry: Number,
        disgust: Number,
        fear: Number,
        happy: Number,
        sad: Number,
        surprise: Number,
        neutral: Number,
      },
    },
  ],
  overallAnalysis: {
    emotions: {
      angry: Number,
      disgust: Number,
      fear: Number,
      happy: Number,
      sad: Number,
      surprise: Number,
      neutral: Number,
    },
  },
});

const Analysis = mongoose.model("Analysis", AnalysisSchema);

let currentSessionId = null;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!currentSessionId) {
      return cb(new Error("Session ID is missing."), null);
    }
    const sessionPath =
      file.fieldname === "webcam"
        ? path.join(__dirname, "uploads", "webcam_images", currentSessionId)
        : path.join(__dirname, "uploads", "screenshots", currentSessionId);
    fs.mkdirSync(sessionPath, { recursive: true });
    cb(null, sessionPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.png`);
  },
});

const upload = multer({ storage });

app.get("/start-session", (req, res) => {
  currentSessionId = `session_${Date.now()}`;
  res.json({ sessionId: currentSessionId });
});

app.post(
  "/upload",
  upload.fields([{ name: "screenshot" }, { name: "webcam" }]),
  (req, res) => {
    if (!currentSessionId) {
      return res.status(400).json({ error: "Session ID is missing." });
    }
    res.json({ message: "Images uploaded successfully!" });
  }
);

app.get("/sessions", (req, res) => {
  const sessionsDir = path.join(__dirname, "uploads", "webcam_images");
  fs.readdir(sessionsDir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error reading sessions directory" });
    }
    res.json({ sessions: files });
  });
});

app.get("/analyze/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const sessionDir = path.join(
    __dirname,
    "uploads",
    "webcam_images",
    sessionId
  );

  try {
    const files = await fs.promises.readdir(sessionDir);
    const imageAnalyses = [];
    const overallAnalysis = {
      emotions: {
        angry: 0,
        disgust: 0,
        fear: 0,
        happy: 0,
        sad: 0,
        surprise: 0,
        neutral: 0,
      },
    };

    for (const file of files) {
      const imagePath = path.join(sessionDir, file);
      const analysis = await analyzeImage(imagePath);
      imageAnalyses.push({ imagePath: file, emotions: analysis });

      for (let emotion in overallAnalysis.emotions) {
        overallAnalysis.emotions[emotion] += parseFloat(analysis[emotion]);
      }
    }

    const total = Object.values(overallAnalysis.emotions).reduce(
      (a, b) => a + b,
      0
    );

    if (total > 0) {
      for (let emotion in overallAnalysis.emotions) {
        overallAnalysis.emotions[emotion] = (
          (overallAnalysis.emotions[emotion] / total) *
          100
        ).toFixed(2);
      }
    } else {
      for (let emotion in overallAnalysis.emotions) {
        overallAnalysis.emotions[emotion] = "0.00";
      }
    }

    const analysisDoc = new Analysis({
      sessionId,
      imageAnalysis: imageAnalyses,
      overallAnalysis,
    });
    await analysisDoc.save();

    res.json({ imageAnalyses, overallAnalysis });
  } catch (error) {
    console.error("Error during analysis:", error);
    res.status(500).json({ error: "Error analyzing images" });
  }
});

async function analyzeImage(imagePath) {
  try {
    const imageBuffer = await fs.promises.readFile(imagePath);

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Image file is empty or unreadable.");
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/motheecreator/vit-Facial-Expression-Recognition",
      imageBuffer,
      {
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
      }
    );

    const emotions = {
      angry: "0.00",
      disgust: "0.00",
      fear: "0.00",
      happy: "0.00",
      sad: "0.00",
      surprise: "0.00",
      neutral: "0.00",
    };

    response.data.forEach((result) => {
      if (result.label.toLowerCase() in emotions) {
        emotions[result.label.toLowerCase()] = (result.score * 100).toFixed(2);
      }
    });

    return emotions;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      angry: "0.00",
      disgust: "0.00",
      fear: "0.00",
      happy: "0.00",
      sad: "0.00",
      surprise: "0.00",
      neutral: "0.00",
    };
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
