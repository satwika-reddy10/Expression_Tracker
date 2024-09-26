const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create directories for uploads if they don't exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createUploadDir("uploads/screenshots");
createUploadDir("uploads/webcam_images");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the destination based on the field name
    if (file.fieldname === "screenshot") {
      cb(null, "uploads/screenshots/");
    } else if (file.fieldname === "webcam") {
      cb(null, "uploads/webcam_images/");
    } else {
      cb(new Error("Unknown file type"));
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Endpoint to handle file uploads
app.post(
  "/upload",
  upload.fields([{ name: "screenshot" }, { name: "webcam" }]),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    // Access the uploaded files
    const screenshot = req.files["screenshot"]
      ? req.files["screenshot"][0]
      : null;
    const webcam = req.files["webcam"] ? req.files["webcam"][0] : null;

    console.log("Screenshot uploaded:", screenshot);
    console.log("Webcam image uploaded:", webcam);

    res.send({
      message: "Files uploaded successfully",
      files: {
        screenshot: screenshot ? screenshot.filename : null,
        webcam: webcam ? webcam.filename : null,
      },
    });
  }
);

// Serve static files (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
