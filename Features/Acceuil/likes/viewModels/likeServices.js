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


