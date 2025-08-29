const service = require('../viewModels/commentServices.js');

exports.addCommentToAcceuilItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text, acceuilItemType } = req.body; // ADD acceuilItemType

    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    if (!userId || !text || !acceuilItemType) { // ADD validation
      return res.status(400).json({ message: 'User ID, comment, and item type are required' });
    }

    const newComment = await service.addCommentToAcceuilItem({
      acceuilItemId: id,
      acceuilItemType: acceuilItemType, // ADD THIS
      userId: userId,
      text,
      imageUrl: imagePath,
      createdAt: new Date(),
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommentsForAcceuilItem = async (req, res) => {
  try {
    const { id } = req.params; // acceuil item ID
    const comments = await service.getCommentsByAcceuilItemId(id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
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