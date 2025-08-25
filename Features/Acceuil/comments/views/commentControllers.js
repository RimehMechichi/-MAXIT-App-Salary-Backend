const service = require('../viewModels/commentServices.js');

exports.create = async (req, res) => {
  try {
    const { titre_eventEco, description_eventEco, date_eventEco } = req.body;

    // ✅ Chemin URL relatif :
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    if (!titre_eventEco || !description_eventEco || !date_eventEco || !imagePath) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEvent = await service.createcomments({
      titre_eventEco,
      description_eventEco,
      date_eventEco,
      image_eventEco: imagePath,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const comments = await service.getAllcomments();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const comment = await service.getcommentById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'comment not found' });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updatecomments(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'comments not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deletecomments(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'comments not found' });
    res.json({ message: 'comments deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};