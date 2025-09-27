const Comment = require('../models/commentsModels');

// Create comment
async function createComment(data) {
  return await Comment.create(data);
}

// Get all comments
async function getAllComments() {
  return await Comment.find();
}

// Get comment by ID
async function getCommentById(_id) {
  return await Comment.findOne({ _id });
}

// Get comments by item
async function getCommentsByItem(acceuilItemId, acceuilItemType) {
  return await Comment.find({ acceuilItemId, acceuilItemType }).sort({ createdAt: -1 });
}

// Update comment
async function updateComment(commentId, data) {
  return await Comment.findByIdAndUpdate(commentId, data, { new: true });
}


// Delete comment
async function deleteComment(_id) {
  return await Comment.findOneAndDelete({ _id });
}

// Get comment count for item
async function getCommentCount(acceuilItemId, acceuilItemType) {
  return await Comment.countDocuments({ acceuilItemId, acceuilItemType });
}

module.exports = {
  createComment,
  getAllComments,
  getCommentById,
  getCommentsByItem,
  updateComment,
  deleteComment,
  getCommentCount
};