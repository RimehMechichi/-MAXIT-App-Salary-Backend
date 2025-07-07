const service = require('../viewModels/congeService.js');
const User = require('/Users/Asus/Desktop/StagePFE/appsalary-backend/Features/Authentification/models/user.model.js');
const Conge = require('../models/congeModel');

exports.create = async (req, res) => {
    console.log('Headers:', req.headers);
    console.log('Body (raw):', req.body); // Check the raw dates here

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body is empty or missing' });
    }

    try {
        const debut = new Date(req.body.dateDebut);
        const fin = new Date(req.body.dateFin);

        console.log('Parsed dateDebut:', debut); // Check if this is "Invalid Date"
        console.log('Parsed dateFin:', fin);   // Check if this is "Invalid Date"

        // Check if the parsed dates are valid
        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
            console.error('Date parsing failed: One or both dates are invalid.');
            return res.status(400).json({ message: 'Invalid date format provided.' });
        }

        const joursAbsence = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Use .getTime() for robust difference
        console.log('Calculated joursAbsence:', joursAbsence); // See if this is NaN

        if (isNaN(joursAbsence)) {
            console.error('joursAbsence calculation resulted in NaN.');
            return res.status(500).json({ message: 'Error calculating duration of absence.' });
        }

        const user = await User.findById(req.body.userId);
        if (!user) {
            console.warn('User not found for ID:', req.body.userId);
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        console.log('User soldeRestant before calculation:', user.soldeRestant); // Check initial user balance

        if (user.soldeRestant < joursAbsence) {
            return res.status(400).json({ message: 'Solde insuffisant pour cette absence' });
        }

        user.soldeRestant -= joursAbsence;
        console.log('User soldeRestant after subtraction (for saving user):', user.soldeRestant); // Check this value
        await user.save();

        const conge = new Conge({
            ...req.body,
            soldeRestant: user.soldeRestant, // This is the value Mongoose is complaining about
        });

        console.log('Conge object about to be saved:', conge); // Inspect the full conge object
        await conge.save();

        res.status(201).json({ message: 'Congé enregistré', conge });
    } catch (error) {
        console.error('Create conge error:', error);
        res.status(500).json({
            message: 'Erreur lors de la création du congé',
            error: error.message || error.toString() || error
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

exports.getByUser = async (req, res) => {
  try {
    const conges = await service.getCongesByUser(req.params.userId);
    res.json(conges);
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
