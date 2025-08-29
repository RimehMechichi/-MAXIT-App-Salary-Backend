const service = require('../viewModels/likeServices.js');
const mongoose = require('mongoose');

// Add this helper function at the top of your file
const getCleanObjectId = (id) => {
  // Check if the ID contains a hyphen, which suggests it has a prefix
  if (id.includes('-')) {
    const parts = id.split('-');
    // The last part should be the ObjectId
    return parts[parts.length - 1];
  }
  // If no prefix, assume it's a direct ObjectId
  return id;
};

exports.likeAcceuilItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, acceuilItemType } = req.body;

    if (!userId || !acceuilItemType) {
      return res.status(400).json({ message: 'User ID and item type are required' });
    }

    // Process the ID to get the clean ObjectId
    const cleanAcceuilId = getCleanObjectId(id);

    if (!mongoose.Types.ObjectId.isValid(cleanAcceuilId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const existingInteraction = await service.findInteractionByUserAndItem(
      userId, cleanAcceuilId, acceuilItemType
    );

    if (existingInteraction) {
      if (existingInteraction.like) {
        await service.deleteLike(existingInteraction._id);
        return res.json({ message: 'Like removed', liked: false });
      } else {
        const updated = await service.updatelikes(existingInteraction._id, {
          like: true,
          dislike: false
        });
        return res.json({ message: 'Dislike changed to like', liked: true });
      }
    }

    const newLike = await service.createlike({
      acceuilItemId: cleanAcceuilId,
      acceuilItemType: acceuilItemType,
      userId: userId,
      like: true,
      dislike: false,
    });

    res.status(201).json({ message: 'Item liked', liked: true, like: newLike });
  } catch (error) {
    console.error('Error in likeAcceuilItem:', error);
    res.status(500).json({ message: `Failed to process like: ${error.message}` });
  }
};

exports.dislikeAcceuilItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, acceuilItemType } = req.body;

    if (!userId || !acceuilItemType) {
      return res.status(400).json({ message: 'User ID and item type are required' });
    }

    // Process the ID to get the clean ObjectId
    const cleanAcceuilId = getCleanObjectId(id);

    if (!mongoose.Types.ObjectId.isValid(cleanAcceuilId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const existingInteraction = await service.findInteractionByUserAndItem(
      userId, cleanAcceuilId, acceuilItemType
    );

    if (existingInteraction) {
      if (existingInteraction.dislike) {
        await service.deleteDislike(existingInteraction._id);
        return res.json({ message: 'Dislike removed', disliked: false });
      } else {
        const updated = await service.updatelikes(existingInteraction._id, {
          like: false,
          dislike: true
        });
        return res.json({ message: 'Like changed to dislike', disliked: true });
      }
    }
    
    const newDislike = await service.createdislike({
      acceuilItemId: cleanAcceuilId,
      acceuilItemType: acceuilItemType,
      userId: userId,
      like: false,
      dislike: true,
    });
    
    res.status(201).json({ message: 'Item disliked', disliked: true, dislike: newDislike });
  } catch (error) {
    console.error('Error in dislikeAcceuilItem:', error);
    res.status(500).json({ message: `Failed to process dislike: ${error.message}` });
  }
};

exports.getLikesForAcceuilItem = async (req, res) => {
  try {
    const { id } = req.params;
    const likes = await service.getLikesForAcceuilItem(id);
    res.status(200).json(likes);
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
    const deleted = await service.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'likes not found' });
    res.json({ message: 'likes deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};