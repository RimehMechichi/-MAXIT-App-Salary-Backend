const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  username: String,
  email: String,
  statusUser: String,
  statusCompte: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: String,
  rib: String,
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
  ],
});

const User = mongoose.model('User', userSchema);

