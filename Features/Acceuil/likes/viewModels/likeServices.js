<<<<<<< HEAD
const like = require('../models/likesModels');

// Create
async function createlikes(data) {
  return await like.create(data);
}

// Read All
async function getAlllikes() {
  return await like.find();
}

// Read One
async function getlikeById(_id) {
  return await like.findOne({ _id });
}

// Update
async function updatelikes(_id, data) {
  return await like.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deletelikes(_id) {
  return await like.findOneAndDelete({ _id});
}

module.exports = {
  createlikes,
  getAlllikes,
  getlikeById,
  updatelikes,
  deletelikes,
};


=======
const Like = require('../models/likesModels');

// Create like or dislike
async function createLike(data) {
  return await Like.create(data);
}

// Get all likes
async function getAllLikes() {
  return await Like.find();
}

// Get like by ID
async function getLikeById(_id) {
  return await Like.findById(_id);
}

// Get likes by item
async function getLikesByItem(acceuilItemId, acceuilItemType) {
  return await Like.find({ acceuilItemId, acceuilItemType });
}

// Check if user has interaction with item
async function checkUserLike(userId, acceuilItemId, acceuilItemType) {
  return await Like.findOne({ userId, acceuilItemId, acceuilItemType });
}

// Delete like by ID
async function deleteLike(_id) {
  return await Like.findByIdAndDelete(_id);
}

// Delete like by user and item
async function deleteLikeByUserAndItem(userId, acceuilItemId, acceuilItemType) {
  return await Like.findOneAndDelete({ userId, acceuilItemId, acceuilItemType });
}

// Get like count for item
async function getLikeCount(acceuilItemId, acceuilItemType) {
  return await Like.countDocuments({ 
    acceuilItemId, 
    acceuilItemType, 
    like: true 
  });
}

// Get dislike count for item
async function getDislikeCount(acceuilItemId, acceuilItemType) {
  return await Like.countDocuments({ 
    acceuilItemId, 
    acceuilItemType, 
    dislike: true 
  });
}

// Update like
async function updateLike(_id, data) {
  return await Like.findByIdAndUpdate(_id, data, { new: true });
}

module.exports = {
  createLike,
  getAllLikes,
  getLikeById,
  getLikesByItem,
  checkUserLike,
  deleteLike,
  deleteLikeByUserAndItem,
  getLikeCount,
  getDislikeCount,
  updateLike
};
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
