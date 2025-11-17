const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true
  },
  username: {
    type: String,
    minlength: 3,
    maxlength: 30,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{8,15}$/
  },
  picture: {
    type: String,
    default: null
  },
  departement: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  soldeRestant: {
    type: Number,
    required: true, 
    default: 25 
  },
<<<<<<< HEAD
  firstName: { 
    type: String, 
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true 
  },
  username: { 
    type: String,
    minlength: 3,
    maxlength: 30,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/ 
  },
  phone: { 
    type: String, 
    required: true,
    match: /^[0-9]{8,15}$/ 
  },
  congeRestant: {
    type: Number,
    required: true,
  },
  picture: { 
    type: String,
    default: null 
  },
  departement: { 
    type: String, 
    required: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6 
  },
  jobTitle: { 
    type: String, 
    required: true,
    trim: true 
  },
  statusUser: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE
  },
  statusCompte: {
    type: String,
    enum: Object.values(ACCOUNT_STATUS),
    default: ACCOUNT_STATUS.UNCONFIRMED
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: String },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
=======
  statusUser: {
    type: String,
    enum: ['active', 'inactive', 'Confirmé'],
    default: 'active'
  },
  statusCompte: {
    type: String,
    enum: ['enabled', 'disabled', 'actif'],
    default: 'enabled'
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: String },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);