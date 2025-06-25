const review = require('../models/reviewModel.js');

// Create
async function createreviews(data) {
  return await review.create(data);
}

// Read All
async function getAllreviews() {
  return await review.find();
}

// Read One
async function getreviewById(_id) {
  return await review.findOne({ _id });
}
/*
// Update
async function updatereviews(_id, data) {
  return await review.findOneAndUpdate({ _id }, data, { new: true });
}*/

// Delete
async function deletereviews(_id) {
  return await review.findOneAndDelete({ _id});
}

module.exports = {
  createreviews,
  getAllreviews,
  getreviewById,
  //updatereviews,
  deletereviews,
};


