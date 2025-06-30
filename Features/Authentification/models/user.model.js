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
  statusUser: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  statusCompte: {
    type: String,
    enum: ['enabled', 'disabled'],
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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
