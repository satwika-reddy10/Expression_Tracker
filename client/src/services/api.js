// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:5000";

// Function to upload screenshot and webcam images to the server
export const uploadImages = async (screenshot, webcamImage) => {
  try {
    const formData = new FormData();
    formData.append("screenshot", screenshot); // Append screenshot
    formData.append("webcam", webcamImage); // Append webcam image

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};
