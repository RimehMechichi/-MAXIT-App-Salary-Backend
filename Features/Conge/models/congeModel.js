const mongoose = require('mongoose');

const congeSchema = new mongoose.Schema({
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  type: { type: String },
  statut: { type: String },
  certificat: { type: String },
  commentaire: { type: String },
  // Reference the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Conge', congeSchema);