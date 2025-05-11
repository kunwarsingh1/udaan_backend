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

        if (!fs.existsSync(imagePath)) {
            return res.status(404).send('<h1>Image not found</h1>');
        }

        // Read image and convert to base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");
        const mimeType = mime.lookup(imagePath) || "image/png";
        const dataURL = `data:${mimeType};base64,${base64Image}`;

        // Return an HTML page that shows the image and has a download link
        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Download Image</title>
                <style>
                    body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background-color: #1f1f1f;
                        color: #fbbf24;
                        font-family: sans-serif;
                        margin: 0;
                    }
                    img {
                        max-width: 80%;
                        height: auto;
                        border-radius: 12px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.5);
                    }
                    a.button {
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: linear-gradient(to right, #f59e0b, #fbbf24);
                        color: #000;
                        font-weight: bold;
                        border-radius: 8px;
                        text-decoration: none;
                        transition: background 0.3s ease;
                    }
                    a.button:hover {
                        background: linear-gradient(to right, #fcd34d, #fde68a);
                    }
                </style>
            </head>
            <body>
                <h1>Download Your Photo</h1>
                <img src="${dataURL}" alt="Your Photo" />
                <a class="button" href="${dataURL}" download="${imageName}">Download Image</a>
            </body>
            </html>
        `);
    } catch (error) {
        return res.status(500).send(`<h1>Error: ${error.message}</h1>`);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
