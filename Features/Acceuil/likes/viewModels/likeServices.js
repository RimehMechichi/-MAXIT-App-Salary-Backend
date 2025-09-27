const Like = require('../models/likesModels');

// Create like
async function createLike(data) {
  return await Like.create(data);
}
// Get all likes
async function getAllLikes() {
  return await Like.find();
}

// Get like by ID
async function getLikeById(_id) {
  return await Like.findOne({ _id });
}

// Get likes by item
async function getLikesByItem(acceuilItemId, acceuilItemType) {
  return await Like.find({ acceuilItemId, acceuilItemType });
}

// Check if user liked item
async function checkUserLike(userId, acceuilItemId, acceuilItemType) {
  return await Like.findOne({ userId, acceuilItemId, acceuilItemType });
}

// Delete like
async function deleteLike(_id) {
  return await Like.findOneAndDelete({ _id });
}

// Delete like by user and item
async function deleteLikeByUserAndItem(userId, acceuilItemId, acceuilItemType) {
  return await Like.findOneAndDelete({ userId, acceuilItemId, acceuilItemType });
}

// Get like count for item
async function getLikeCount(acceuilItemId, acceuilItemType) {
  return await Like.countDocuments({ acceuilItemId, acceuilItemType });
}

module.exports = {
  createLike,
  getAllLikes,
  getLikeById,
  getLikesByItem,
  checkUserLike,
  deleteLike,
  deleteLikeByUserAndItem,
  getLikeCount
};