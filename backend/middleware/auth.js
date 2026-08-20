const jwt = require('jsonwebtoken');

const protectAdmin = (req, res, next) => {
  try {
    let token = '';

    // Check header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_at_least_32_chars');
    
    // Attach admin info to request
    req.admin = { id: decoded.id, username: decoded.username };
    next();
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

module.exports = { protectAdmin };
