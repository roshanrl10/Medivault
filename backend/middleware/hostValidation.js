const allowedHosts = process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : ['localhost:5000', 'localhost:5001', 'localhost:5173', '127.0.0.1:5000', '127.0.0.1:5001'];

const hostValidation = (req, res, next) => {
    const host = req.headers.host;
    console.log(`[Host Validation] Incoming Host: ${host}`); // DEBUG
    if (allowedHosts.includes(host)) {
        next();
    } else {
        console.warn(`[Host Validation] Blocked Host: ${host}`);
        // res.status(403).send('Forbidden Host'); // Temporarily disabled for debugging
        next(); // Allow for now
    }
};

module.exports = hostValidation;
