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

    // Check if user already has an interaction with this item
    const existingInteraction = await service.checkUserLike(
      userId, cleanAcceuilId, acceuilItemType
    );

    if (existingInteraction) {
      if (existingInteraction.like) {
        // If already liked, remove the like
        await service.deleteLike(existingInteraction._id);
        return res.json({ message: 'Like removed', liked: false });
      } else {
        // If disliked, update to like
        await service.deleteLike(existingInteraction._id);
        const newLike = await service.createLike({
          acceuilItemId: cleanAcceuilId,
          acceuilItemType: acceuilItemType,
          userId: userId,
          like: true,
          dislike: false,
        });
        return res.json({ message: 'Dislike changed to like', liked: true, like: newLike });
      }
    }

    // Create new like
    const newLike = await service.createLike({
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

    // Check if user already has an interaction with this item
    const existingInteraction = await service.checkUserLike(
      userId, cleanAcceuilId, acceuilItemType
    );

    if (existingInteraction) {
      if (existingInteraction.dislike) {
        // If already disliked, remove the dislike
        await service.deleteLike(existingInteraction._id);
        return res.json({ message: 'Dislike removed', disliked: false });
      } else {
        // If liked, update to dislike
        await service.deleteLike(existingInteraction._id);
        const newDislike = await service.createLike({
          acceuilItemId: cleanAcceuilId,
          acceuilItemType: acceuilItemType,
          userId: userId,
          like: false,
          dislike: true,
        });
        return res.json({ message: 'Like changed to dislike', disliked: true, dislike: newDislike });
      }
    }

    // Create new dislike
    const newDislike = await service.createLike({
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
    const { acceuilItemType } = req.query;
    
    if (!acceuilItemType) {
      return res.status(400).json({ message: 'Item type is required as query parameter' });
    }
    
    const cleanAcceuilId = getCleanObjectId(id);
    const likes = await service.getLikesByItem(cleanAcceuilId, acceuilItemType);
    
    // Get like and dislike counts
    const likeCount = likes.filter(like => like.like).length;
    const dislikeCount = likes.filter(like => like.dislike).length;
    
    res.status(200).json({
      itemId: cleanAcceuilId,
      itemType: acceuilItemType,
      likes: likes,
      likeCount: likeCount,
      dislikeCount: dislikeCount,
      totalInteractions: likes.length
    });
  } catch (error) {
    console.error('Error in getLikesForAcceuilItem:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const likes = await service.getAllLikes();
    res.json({
      count: likes.length,
      likes: likes
    });
  } catch (err) {
    console.error('Error in getAll:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const like = await service.getLikeById(req.params.id);
    if (!like) return res.status(404).json({ message: 'Like not found' });
    res.json(like);
  } catch (err) {
    console.error('Error in getById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteLike(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Like not found' });
    res.json({ message: 'Like deleted successfully', deletedLike: deleted });
  } catch (err) {
    console.error('Error in delete:', err);
    res.status(500).json({ message: err.message });
  }
};