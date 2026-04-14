const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies JWT from httpOnly cookie and attaches user to req
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated. Please log in.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    const user = await User.findById(decoded.id).populate('clubRef', 'name logo _id');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account not found or is inactive.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};

/**
 * requireRole — role-based access guard (use after protect)
 * Usage: router.get('/path', protect, requireRole('superadmin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
  }
  next();
};

module.exports = { protect, requireRole };
