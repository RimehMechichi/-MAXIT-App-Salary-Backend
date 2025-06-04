const service = require('../viewModels/annuairesService');



exports.getAll = async (req, res) => {
  try {
    const annuaires = await service.getAllannuaires();
    res.json(annuaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const annuaire = await service.getannuaireById(req.params.id);
    if (!annuaire) return res.status(404).json({ message: 'annuaire not found' });
    res.json(annuaire);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
