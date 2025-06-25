const service = require('../viewModels/reviewServices.js');


exports.create = async (req, res) => {
  try {
    const reviews = await service.createreviews(req.body);
    res.status(201).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const reviews = await service.getAllreviews();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const review = await service.getreviewById(req.params.id);
    if (!review) return res.status(404).json({ message: 'review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/*
exports.update = async (req, res) => {
  try {
    const updated = await service.updatereviews(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'reviews not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
*/
exports.delete = async (req, res) => {
  try {
    const deleted = await service.deletereviews(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'reviews not found' });
    res.json({ message: 'reviews deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};