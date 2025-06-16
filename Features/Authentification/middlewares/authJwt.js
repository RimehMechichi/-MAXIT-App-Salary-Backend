const jwt = require ('jsonwebtoken');
const config = require ('../config/auth.config.js');
const db = require ('../models/index.js');

const User = db.user;
const Role = db.role;

const verifyToken = (req, res, next) => {
    console.log("Verifying token...");
    let token = req.get('Authorization');
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    token = token.split(' ')[1]; // Assuming token is in "Bearer <token>" format

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).exec();
        if (!user) {
            return res.status(404).send({ message: "User not found!" });
        }

        const roles = await Role.find({ _id: { $in: user.roles } }).exec();
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin") {
                next();
                return;
            }
        }

        return res.status(403).send({ message: "Require Admin Role!" });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

const isUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).exec();
        if (!user) {
            return res.status(404).send({ message: "User not found!" });
        }

        const roles = await Role.find({ _id: { $in: user.roles } }).exec();
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "user") {
                next();
                return;
            }
        }

        return res.status(403).send({ message: "Require User Role!" });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isUser,
};

module.exports = authJwt;
