const mongoose = require('mongoose');

const congeSchema = new mongoose.Schema({
  idConge: { type: String, required: true, unique: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  type: { type: String },
  statut: { type: String },
  soldeRestant: { type: Number, required: true , default: 25},
  certificat: { type: String },
  commentaire: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Conge', congeSchema);
