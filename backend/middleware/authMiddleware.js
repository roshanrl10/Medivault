exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ msg: 'Please log in to view this resource' });
};

exports.ensureRole = (role) => {
    return (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === role) {
            return next();
        }
        res.status(403).json({ msg: 'Access Denied: Insufficient Permissions' });
    };
};

exports.ensureAnyRole = (roles) => {
    return (req, res, next) => {
        if (req.isAuthenticated() && roles.includes(req.user.role)) {
            return next();
        }
        res.status(403).json({ msg: 'Access Denied: Insufficient Permissions' });
    };
}
