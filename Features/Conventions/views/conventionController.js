const service = require('../viewModels/conventionsService');


exports.create = async (req, res) => {
  try {
    const conventions = await service.createconventions(req.body);
    res.status(201).json(conventions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const conventions = await service.getAllconventions();
    res.json(conventions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const convention = await service.getconventionById(req.params.id);
    if (!convention) return res.status(404).json({ message: 'convention not found' });
    res.json(convention);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updateconventions(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'conventions not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteconventions(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'conventions not found' });
    res.json({ message: 'conventions deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};