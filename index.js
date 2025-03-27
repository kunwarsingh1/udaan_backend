const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require('cors')
const mime = require("mime-types"); // To get MIME type of the file


const app = express();
const PORT = 5000;

// Middleware to parse JSON data
app.use(bodyParser.json({ limit: "50mb" })); // Increase limit for larger images

app.use(cors())

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


app.get("/",(req,res)=>{
    res.send("Hello")
})

// API to handle image upload
app.post("/upload", (req, res) => {
    try {
        const { image, filename } = req.body;

        if (!image || !filename) {
            return res.status(400).json({ error: "Image and filename are required" });
        }

        // Remove the "data:image/png;base64," part if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // Define the path to save the image
        const filePath = path.join(uploadDir, filename);

        // Write file to disk
        fs.writeFileSync(filePath, base64Data, { encoding: "base64" });

        return res.json({ message: "Image saved successfully!", filePath });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


app.get('/image/:img', (req, res) => {
    try {
        const imageName = req.params.img;
        const imagePath = path.join(__dirname, "uploads", imageName);

        // Check if the file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: "Image not found" });
        }

        // Read file and convert to Base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");

        // Get MIME type (e.g., "image/png")
        const mimeType = mime.lookup(imagePath) || "application/octet-stream";

        // Create Data URL
        const dataURL = `data:${mimeType};base64,${base64Image}`;

        // Send response with Data URL
        return res.json({ imageDataURL: dataURL });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
