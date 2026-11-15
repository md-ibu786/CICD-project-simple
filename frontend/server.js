import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const BACKEND_URL =
    process.env.BACKEND_URL || "http://localhost:5000";

app.use(express.json());

// Forward form data to Flask
app.post("/api/submit", async (req, res) => {
    try {
        const response = await fetch(
            `${BACKEND_URL}/submit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        console.error("Backend connection error:", error);

        res.status(502).json({
            error: "Unable to connect to Flask backend"
        });
    }
});

// Serve React production build
app.use(express.static(path.join(__dirname, "dist")));

// React routing fallback
app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
        return next();
    }

    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend server running on port ${PORT}`);
});