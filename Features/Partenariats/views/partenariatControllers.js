const service = require('../viewModels/partenariatServices.js');

exports.create = async (req, res) => {
  try {
    const partenariat = await service.createpartenariat(req.body);
    res.status(201).json(partenariat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const partenariats = await service.getAllpartenariats();
    res.json(partenariats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const partenariat = await service.getpartenariatById(req.params.id);
    if (!partenariat) return res.status(404).json({ message: 'partenariat not found' });
    res.json(partenariat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updatepartenariat(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'partenariat not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deletepartenariat(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'partenariat not found' });
    res.json({ message: 'partenariat deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
