const mongoose = require('mongoose');
const User = require('../models/userModels.js');
const Role = require('../models/role.model.js');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.user = User;
db.role = Role;
db.ROLES = ['user', 'admin'];

module.exports = db;
