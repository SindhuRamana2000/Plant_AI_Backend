import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const PORT = process.env.PORT || 8000;
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_MODEL_URL = "https://serverless.roboflow.com/plant-disease-detection-2j8lg/1";

if (!ROBOFLOW_API_KEY) {
  console.error("❌ ROBOFLOW_API_KEY not found in .env");
  process.exit(1);
}

const app = express();

// Allow your frontend origins
app.use(cors({
  origin: ["http://localhost:5173",], // add more if needed
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// Accept JSON payloads up to 10MB
app.use(express.json({ limit: "10mb" }));

// Root route
app.get("/", (req, res) => {
  res.json({ status: "Server running" });
});

// Waste image classification route
app.post("/api/classify", async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: "No imageData provided" });
    }

    // Send request to Roboflow serverless model
    const response = await axios({
      method: "POST",
      url: ROBOFLOW_MODEL_URL,
      params: { api_key: ROBOFLOW_API_KEY },
      data: imageData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Return Roboflow results to frontend
    res.json({ results: response.data });

  } catch (err) {
    console.error("❌ Roboflow API error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to classify image",
      details: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});