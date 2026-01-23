require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
// const session = require('express-session'); // Removed for Stateless JWT
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const hostValidation = require('./middleware/hostValidation');
// const { doubleCsrf } = require("csrf-csrf"); // Will implement if needed, or stick to httpOnly cookie + separate CSRF solution

const app = express();

// Passport Config
require('./config/passport')(passport);

// Middleware Imports
const { limiter, loginLimiter } = require('./middleware/securityMiddleware');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // Adjust if external scripts needed
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));

// CORS Configuration
const allowedOrigins = ['http://localhost:5173']; // Whitelist trusted domains
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(hostValidation); // Host Header Validation

// Routes
app.use('/api/auth/login', loginLimiter); // Strict limit for login
app.use('/api', limiter); // General API limit
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes Review
app.get('/', (req, res) => {
    res.send('Medivault Backend Security Shield Active');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Global Error]', err); // Detailed logging
    const msg = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    res.status(500).json({ msg });
});

const fs = require('fs');
const https = require('https');
const path = require('path');

// ... (existing error handler)

const PORT = process.env.PORT || 5000;

// SSL Certificates
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certificates', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certificates', 'server.crt'))
};

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`✅ Secure Server running on port ${PORT} (https://localhost:${PORT})`);
    console.log(`[Server] Timestamp: ${new Date().toISOString()}`); // Force restart
});
