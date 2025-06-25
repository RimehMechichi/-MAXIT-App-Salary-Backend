const service = require('../viewModels/ideaBoxServices.js');

exports.create = async (req, res) => {
  try {
    const {
      boxTitle,
      boxObject,
      department,
      category,
      createdAt,
      isAnonymous
    } = req.body;

    // Optional: validate required fields
    if (!boxTitle || !boxObject || !department || !category || !createdAt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newIdea = {
      boxTitle,
      boxObject,
      department,
      category,
      createdAt: new Date(createdAt),
      isAnonymous: isAnonymous ?? false,
    };

    const ideaBox = await service.createideaBox(newIdea);
    res.status(200).json(ideaBox);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const ideaBoxs = await service.getAllideaBoxs();
    res.json(ideaBoxs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const ideaBox = await service.getideaBoxById(req.params.id);
    if (!ideaBox) return res.status(404).json({ message: 'ideaBox not found' });
    res.json(ideaBox);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/*
exports.update = async (req, res) => {
  try {
    const updated = await service.updateideaBox(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'ideaBox not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteideaBox(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'ideaBox not found' });
    res.json({ message: 'ideaBox deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
*/