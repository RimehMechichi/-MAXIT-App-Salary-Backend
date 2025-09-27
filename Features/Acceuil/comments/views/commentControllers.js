const commentService = require('../viewModels/commentServices.js');

// Add comment to a post
exports.addComment = async (req, res) => {
  try {
    const { userId, userName, userAvatar, text, acceuilItemType } = req.body;
    const acceuilItemId = req.params.id;

    if (!userId || !userName || !text || !acceuilItemType) {
      return res.status(400).json({ message: 'User ID, user name, text, and item type are required' });
    }

    const newComment = await commentService.createComment({
      userId,
      userName,
      userAvatar: userAvatar || '',
      acceuilItemId,
      acceuilItemType,
      text,
      createdAt: new Date()
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for an item
exports.getCommentsForItem = async (req, res) => {
  try {
    const { acceuilItemType } = req.query;
    const acceuilItemId = req.params.id;

    if (!acceuilItemType) {
      return res.status(400).json({ message: 'Item type is required' });
    }

    const comments = await commentService.getCommentsByItem(acceuilItemId, acceuilItemType);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const commentId = req.params.id;

    if (!text) return res.status(400).json({ message: 'Text is required' });

    const updatedComment = await commentService.updateComment(commentId, { text });

    if (!updatedComment) return res.status(404).json({ message: 'Comment not found' });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const deletedComment = await commentService.deleteComment(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comment count for an item
exports.getCommentCount = async (req, res) => {
  try {
    const { acceuilItemType } = req.query;
    const acceuilItemId = req.params.id;

    if (!acceuilItemType) {
      return res.status(400).json({ message: 'Item type is required' });
    }

    const count = await commentService.getCommentCount(acceuilItemId, acceuilItemType);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};