const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data (e.g., id) to the request
        next();
    } catch (error) {
        return res.status(401).json({ status: false, message: 'Invalid or expired token' });
    }
};

module.exports = { authenticate };
