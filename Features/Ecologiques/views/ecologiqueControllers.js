const service = require('../viewModels/ecologiqueServices.js');


exports.create = async (req, res) => {
  try {
    const ecologiques = await service.createecologiques(req.body);
    res.status(201).json(ecologiques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const ecologiques = await service.getAllecologiques();
    res.json(ecologiques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const ecologique = await service.getecologiqueById(req.params.id);
    if (!ecologique) return res.status(404).json({ message: 'ecologique not found' });
    res.json(ecologique);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updateecologiques(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'ecologiques not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteecologiques(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'ecologiques not found' });
    res.json({ message: 'ecologiques deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};