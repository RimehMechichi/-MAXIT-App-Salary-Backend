exports.isAdmin = (req, res, next) => {
  // Vérifier si l'utilisateur est authentifié et a le rôle d'administrateur
  if (req.user && req.user.role === 'admin' ||'user') {
    next();
  } else {
    res.status(403).json({ message: 'Unauthorized' });
  }
};const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models'); // Assuming models are available via db
const User = db.user; // Assuming db.user is defined
const Role = db.role; // Assuming db.role is defined

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    console.log("Verifying token...");
    let token = null;

    // Try to get token from session first (if express-session is used and token is stored there)
    if (req.session && req.session.token) {
        token = req.session.token;
        console.log("Token from session:", token ? "Found" : "Not Found");
    }

    // If not in session, try to get from Authorization header (e.g., "Bearer <token>")
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
            console.log("Token from Authorization header:", token ? "Found" : "Not Found");
        }
    }

    if (!token) {
        console.log("No token found in session or Authorization header.");
        return res.status(403).send({ message: 'No token provided!' });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err.message);
            // Handle different JWT errors (e.g., TokenExpiredError, JsonWebTokenError)
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send({ message: 'Unauthorized! Token has expired.' });
            }
            return res.status(401).send({ message: 'Unauthorized! Invalid token.' });
        }
        req.userId = decoded.id; // Store userId in request for later use
        console.log("Token verified. User ID:", req.userId);
        next(); // Proceed to the next middleware/route handler
    });
};

// Middleware to check if the user has an admin role
const isAdmin = async (req, res, next) => {
    try {
        // req.userId should be set by verifyToken middleware if it runs before isAdmin
        if (!req.userId) {
            return res.status(403).send({ message: 'User ID not found. Ensure verifyToken runs before isAdmin.' });
        }

        // Populate roles to directly access role names
        const user = await User.findById(req.userId).populate('roles');

        if (!user) {
            return res.status(404).send({ message: 'User not found for role check.' });
        }

        // Check if any of the user's roles is 'admin'
        const hasAdminRole = user.roles.some(role => role.name === 'admin');

        if (hasAdminRole) {
            next(); 
            return;
        }

        res.status(403).send({ message: 'Require Admin Role!' }); 
    } catch (error) {
        console.error('Error in isAdmin middleware:', error);
        res.status(500).send({ message: 'Internal server error during role check.' });
    }
};

// Middleware to check if the user has a user role
const isUser = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(403).send({ message: 'User ID not found. Ensure verifyToken runs before isUser.' });
        }

        const user = await User.findById(req.userId).populate('roles');

        if (!user) {
            return res.status(404).send({ message: 'User not found for role check.' });
        }

        const hasUserRole = user.roles.some(role => role.name === 'user');

        if (hasUserRole) {
            next(); 
            return;
        }

        res.status(403).send({ message: 'Require User Role!' });
    } catch (error) {
        console.error('Error in isUser middleware:', error);
        res.status(500).send({ message: 'Internal server error during role check.' });
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isUser,
};

module.exports = authJwt;