const mongoose = require('mongoose');

const congeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  type: { type: String },
  statut: {
    type: String,
    enum: ['Approuvé', 'Refusé', 'En attente'],
    default: 'En attente'
  },
  soldeRestant: { type: Number, required: true, default: 25 },
  certificat: { type: String },
  commentaire: { type: String },
  motif: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Conge', congeSchema);
