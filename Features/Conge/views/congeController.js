const service = require('../viewModels/congeService.js');

exports.create = async (req, res) => {
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
