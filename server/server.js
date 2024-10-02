const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 5000;

// Store sessions with unique session IDs
let currentSessionId = null;

// Middleware for allowing CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Endpoint to start a new session
app.get("/start-session", (req, res) => {
  if (!currentSessionId) {
    // Generate a new session ID based on the current time
    currentSessionId = `session_${Date.now()}`;
    const sessionDirWebcam = path.join(
      __dirname,
      "uploads",
      "webcam_images",
      currentSessionId
    );
    const sessionDirScreenshots = path.join(
      __dirname,
      "uploads",
      "screenshots",
      currentSessionId
    );

    // Create directories for this session (only if they don't exist)
    fs.mkdirSync(sessionDirWebcam, { recursive: true });
    fs.mkdirSync(sessionDirScreenshots, { recursive: true });

    console.log(`New session started: ${currentSessionId}`);
  }

  res.json({ sessionId: currentSessionId });
});

// Multer setup for image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!currentSessionId) {
      return cb(new Error("Session ID is missing."), null);
    }
    const sessionPath =
      file.fieldname === "webcam"
        ? path.join(__dirname, "uploads", "webcam_images", currentSessionId)
        : path.join(__dirname, "uploads", "screenshots", currentSessionId);
    cb(null, sessionPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.png`); // Save images with a timestamp and .png extension
  },
});

const upload = multer({ storage });

// Image upload endpoint
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

// Endpoint to reset the session when the game ends (optional)
app.get("/end-session", (req, res) => {
  currentSessionId = null; // Reset the session
  res.json({ message: "Session ended" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
