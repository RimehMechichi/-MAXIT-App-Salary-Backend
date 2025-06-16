const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.user = require('../models/userModels.js'); // ce fichier
db.role = require('./role.model.js'); // ton fichier de rôle

db.ROLES = ['user', 'admin'];

module.exports = db;
