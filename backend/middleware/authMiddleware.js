const jwt = require('jsonwebtoken');

exports.ensureAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_prod');
        req.user = decoded.user; // Attach user payload to req.user
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

exports.ensureRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            return next();
        }
        res.status(403).json({ msg: 'Access Denied: Insufficient Permissions' });
    };
};

exports.ensureAnyRole = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            return next();
        }
        res.status(403).json({ msg: 'Access Denied: Insufficient Permissions' });
    };
}
