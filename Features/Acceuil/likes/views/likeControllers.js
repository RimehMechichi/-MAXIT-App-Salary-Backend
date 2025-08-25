const service = require('../viewModels/likeServices.js');

exports.create = async (req, res) => {
  try {
    const { titre_eventEco, description_eventEco, date_eventEco } = req.body;

    // ✅ Chemin URL relatif :
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    if (!titre_eventEco || !description_eventEco || !date_eventEco || !imagePath) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newEvent = await service.createlikes({
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
    const likes = await service.getAlllikes();
    res.json(likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const like = await service.getlikeById(req.params.id);
    if (!like) return res.status(404).json({ message: 'like not found' });
    res.json(like);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updatelikes(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'likes not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deletelikes(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'likes not found' });
    res.json({ message: 'likes deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};