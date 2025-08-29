const Like = require('../models/likesModels.js'); 

async function findLikeByUserAndAcceuil(userId, acceuilItemId) {
  return await Like.findOne({ userId, acceuilItemId, like: true });
}

async function deleteLike(likeId) {
  return await Like.findByIdAndDelete(likeId);
}

async function createlike(data) {
  const like = new Like(data);
  return await like.save();
}

async function findDislikeByUserAndAcceuil(userId, acceuilItemId) {
  return await Like.findOne({ userId, acceuilItemId, dislike: true });
}

async function deleteDislike(dislikeId) {
  return await Like.findByIdAndDelete(dislikeId);
}

// Créer un nouveau dislike
async function createdislike(data) {
  const dislike = new Like(data);
  return await dislike.save();
}

// Obtenir tous les likes d’un item
async function getLikesForAcceuilItem(acceuilItemId) {
  return await Like.find({ acceuilItemId, like: true });
}

// Obtenir tous les likes/dislikes
async function getAlllikes() {
  return await Like.find();
}

// Obtenir un like par ID
async function getlikeById(id) {
  return await Like.findById(id);
}

// Mettre à jour un like/dislike
async function updatelikes(id, data) {
  return await Like.findByIdAndUpdate(id, data, { new: true });
}

// Supprimer par ID
async function deleteById(id) {
  return await Like.findByIdAndDelete(id);
}

module.exports = {
  findLikeByUserAndAcceuil,
  deleteLike,
  createlike,
  findDislikeByUserAndAcceuil,
  deleteDislike,
  createdislike,
  getLikesForAcceuilItem,
  getAlllikes,
  getlikeById,
  updatelikes,
  delete: deleteById,
};
