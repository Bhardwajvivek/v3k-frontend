import axios from "axios";

const API_BASE = "https://v3k-backend-api.onrender.com";

export const fetchSignals = async () => {
  try {
    const response = await axios.get(`${API_BASE}/get-signals`);
    return response.data.signals || [];
  } catch (error) {
    console.error("Error fetching signals:", error);
    return [];
  }
};