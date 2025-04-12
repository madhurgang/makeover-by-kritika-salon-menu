const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const app = express();

const tokens = new Map(); // Store tokens with expiration

// Endpoint to generate the QR code
app.get('/generate', async (req, res) => {
    // Generate a unique token
    const token = crypto.randomBytes(16).toString('hex');
    const expirationTime = Date.now() + 2 * 60 * 1000; // 2 minutes
    tokens.set(token, expirationTime);

    // Construct the URL with the token
    const menuUrl = `https://madhurgang.github.io/make-over-by-kritika-salon-menu/Menu.html?token=${token}`;

    // Set up the QR Code Monkey API request payload
    const qrCodeApiUrl = 'https://api.qrcode-monkey.com/qr/custom';
    const qrCodeConfig = {
        data: menuUrl,
        config: {
            body: "square",
            eye: "frame13",
            eyeBall: "ball14",
            bgColor: "#FFFFFF",
            eye1Color: "#000000",
            eye2Color: "#000000",
            eye3Color: "#000000",
            bodyColor: "#000000",
            gradientColor1: "#000000",
            gradientColor2: "#000000",
            gradientType: "linear",
            logo: "", // Optional: Add your salon logo URL
        },
        size: 300,
        download: false,
        file: "png",
    };

    try {
        // Make a POST request to QR Code Monkey API
        const qrCodeResponse = await axios.post(qrCodeApiUrl, qrCodeConfig, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'arraybuffer', // Get the image as binary data
        });

        // Send the QR code image as a response
        res.setHeader('Content-Type', 'image/png');
        res.send(qrCodeResponse.data);
    } catch (error) {
        console.error('Error generating QR code:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to generate QR code');
    }
});

// Endpoint to validate the token
app.get('/validate', (req, res) => {
    const { token } = req.query;

    // Check if the token is valid and not expired
    const expirationTime = tokens.get(token);
    if (!expirationTime || Date.now() > expirationTime) {
        return res.status(403).send('Link expired. Please scan the QR code again.');
    }

    res.redirect('https://madhurgang.github.io/make-over-by-kritika-salon-menu/Menu.html'); // Redirect to the menu page
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});