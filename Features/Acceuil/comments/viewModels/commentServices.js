const comment = require('../models/commentsModels');

async function addCommentToAcceuilItem(data) {
  return await comment.create(data);
}

async function getCommentsByAcceuilItemId(acceuilItemId) {
  return await comment.find({ acceuilItemId }).populate('userId', 'name email');
}

// Read All comments
async function getAllcomments() {
  return await comment.find().populate('userId', 'name email'); // Adjust based on your user model
}

// Get comment by ID
async function getcommentById(_id) {
  return await comment.findById(_id).populate('userId', 'name email');
}

// Update comment
async function updatecomments(_id, data) {
  return await comment.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete comment
async function deletecomments(_id) {
  return await comment.findOneAndDelete({ _id });
}

module.exports = {
  addCommentToAcceuilItem,
  getCommentsByAcceuilItemId, // Added this missing function
  getAllcomments,
  getcommentById, // Added this function
  updatecomments,
  deletecomments,
};