const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  picture: { type: String, required: true },
  departement: { type: String, required: true },
  password: { type: String, required: true },
  jobTitle: { type: String, required: true },
  statusUser: { type: String },
  statusCompte: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: String },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
