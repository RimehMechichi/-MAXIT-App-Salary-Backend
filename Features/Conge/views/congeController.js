const service = require('../viewModels/congeService.js');
const User = require('/Users/Asus/Desktop/StagePFE/appsalary-backend/Features/Authentification/models/user.model.js');
const Conge = require('../models/congeModel');

exports.create = async (req, res) => {
  console.log('Headers:', req.headers);
  console.log('Body (raw):', req.body);
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Request body is empty or missing' });
  }
  try {
    const debut = new Date(req.body.dateDebut);
    const fin = new Date(req.body.dateFin);

    const joursAbsence = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;

    const user = await User.findById(req.body.idUser);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (user.soldeRestant < joursAbsence) {
      return res.status(400).json({ message: 'Solde insuffisant pour cette absence' });
    }

    user.soldeRestant -= joursAbsence;
    await user.save();

    const conge = new Conge({
      ...req.body,
      soldeRestant: user.soldeRestant, 
    });

    await conge.save();

    res.status(201).json({ message: 'Congé enregistré', conge });
 } catch (error) {
    console.error('Create conge error:', error); // log to console
    res.status(500).json({ 
      message: 'Erreur lors de la création du congé', 
      error: error.message || error.toString() || error // send actual error message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const conges = await service.getAllConges();
    res.json(conges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const conge = await service.getCongeById(req.params.id);
    if (!conge) return res.status(404).json({ message: 'Conge not found' });
    res.json(conge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updateConge(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Conge not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteConge(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Conge not found' });
    res.json({ message: 'Conge deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
