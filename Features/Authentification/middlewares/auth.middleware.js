// middleware/authJwt.js
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');
const User = db.user;

// 🔹 Verify JWT Token
const verifyToken = (req, res, next) => {
  let token = null;

  if (req.session && req.session.token) {
    token = req.session.token;
  }

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: 'Token expired.' });
      }
      return res.status(401).send({ message: 'Invalid token.' });
    }

    req.userId = decoded.id; // store user ID for later
    next();
  });
};

// 🔹 Check Admin Role
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('roles');
    if (!user) return res.status(404).send({ message: 'User not found.' });

    const isAdmin = user.roles.some(role => role.name === 'admin');
    if (!isAdmin) return res.status(403).send({ message: 'Admin role required.' });

    next();
  } catch (err) {
    res.status(500).send({ message: 'Server error during admin check.' });
  }
};

// 🔹 Check Normal User Role
const isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('roles');
    if (!user) return res.status(404).send({ message: 'User not found.' });

    const isUser = user.roles.some(role => role.name === 'user');
    if (!isUser) return res.status(403).send({ message: 'User role required.' });

    next();
  } catch (err) {
    res.status(500).send({ message: 'Server error during user check.' });
  }
};

module.exports = { verifyToken, isAdmin, isUser };
