const jwt = require('jsonwebtoken');

const authorize = (roles) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(403).json({ message: 'Access denied. Please log in.' });

  try {
    const decoded = jwt.verify(token, 'secret_key'); 
    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authorize;
