const service = require('../viewModels/congeService.js');
const User = require('/Users/Asus/Desktop/StagePFE/appsalary-backend/Features/Authentification/models/user.model.js');
const Conge = require('../models/congeModel');

exports.create = async (req, res) => {
    try {
        const debut = new Date(req.body.dateDebut);
        const fin = new Date(req.body.dateFin);

        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({ message: 'Invalid date format provided.' });
        }

        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const conge = new Conge({
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            type: req.body.type,
            commentaire: req.body.commentaire,
            certificat: req.body.certificat,
            motif: req.body.motif,
            statut: 'En attente',
            userId: req.body.userId 
        });

        await conge.save();

        res.status(201).json({ message: 'Demande de congé enregistrée', conge });
    } catch (error) {
        console.error('Create conge error:', error);
        res.status(500).json({ message: 'Erreur lors de la création du congé', error });
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
    const { congeId } = req.params;
    const { statut } = req.body;

    if (!['Approuvé', 'Refusé', 'En attente'].includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide' });
    }

    try {
        const conge = await Conge.findById(congeId);
        if (!conge) {
            return res.status(404).json({ message: 'Congé non trouvé' });
        }

        if (conge.statut === 'Approuvé') {
            return res.status(400).json({ message: 'Ce congé a déjà été approuvé' });
        }

        if (statut === 'Approuvé') {
            const jours = Math.ceil(
                (new Date(conge.dateFin) - new Date(conge.dateDebut)) / (1000 * 60 * 60 * 24)
            ) + 1;

            const user = await User.findById(conge.userId);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            if (user.soldeRestant < jours) {
                return res.status(400).json({ message: 'Solde insuffisant' });
            }

            user.soldeRestant -= jours;
            await user.save();

            conge.soldeRestant = user.soldeRestant;
        }

        conge.statut = statut;
        await conge.save();

        res.status(200).json({ message: 'Statut mis à jour', conge });
    } catch (error) {
        console.error('Update statut error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour', error });
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
