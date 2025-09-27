const likeService  = require('../viewModels/likeServices.js');

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { userId, acceuilItemType } = req.body;
    const acceuilItemId = req.params.id;

    if (!userId || !acceuilItemType) {
      return res.status(400).json({ message: 'User ID and item type are required' });
    }

    // Check if user already liked this item
    const existingLike = await likeService.checkUserLike(userId, acceuilItemId, acceuilItemType);

    if (existingLike) {
      return res.status(400).json({ message: 'Already liked' });
    }

    // Create new like
    const newLike = await likeService.createLike({
      userId,
      acceuilItemId,
      acceuilItemType,
      isLiked: true,
      likedAt: new Date()
    });

    res.status(201).json(newLike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dislike a post (remove like)
exports.dislikePost = async (req, res) => {
  try {
    const { userId, acceuilItemType } = req.body;
    const acceuilItemId = req.params.id;

    if (!userId || !acceuilItemType) {
      return res.status(400).json({ message: 'User ID and item type are required' });
    }

    // Remove the like
    const result = await likeService.deleteLikeByUserAndItem(userId, acceuilItemId, acceuilItemType);

    if (!result) {
      return res.status(404).json({ message: 'Like not found' });
    }

    res.json({ message: 'Disliked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get likes for an item
exports.getLikesForItem = async (req, res) => {
  try {
    const { acceuilItemType } = req.query;
    const acceuilItemId = req.params.id;

    if (!acceuilItemType) {
      return res.status(400).json({ message: 'Item type is required' });
    }

    const likes = await likeService.getLikesByItem(acceuilItemId, acceuilItemType);
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get like count for an item
exports.getLikeCount = async (req, res) => {
  try {
    const { acceuilItemType } = req.query;
    const acceuilItemId = req.params.id;

    if (!acceuilItemType) {
      return res.status(400).json({ message: 'Item type is required' });
    }

    const count = await likeService.getLikeCount(acceuilItemId, acceuilItemType);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};