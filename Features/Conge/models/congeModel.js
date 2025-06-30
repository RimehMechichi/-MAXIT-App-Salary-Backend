const mongoose = require('mongoose');

const congeSchema = new mongoose.Schema({
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateDebut: { type: Date, required: false },
  dateFin: { type: Date, required: false },
  type: { type: String },
  statut: { type: String },
  soldeRestant: { type: Number, required: true, default: 25 },
  certificat: { type: String },
  commentaire: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Conge', congeSchema);
