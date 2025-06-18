const ideaBox = require('../models/ideaBoxModels.js');

// Create
async function createideaBox(data) {
  return await ideaBox.create(data);
}

// Read All
async function getAllideaBoxs() {
  return await ideaBox.find();
}

// Read One
async function getideaBoxById(_id) {
  return await ideaBox.findOne({ _id });
}
/*
// Update
async function updateideaBox(_id, data) {
  return await ideaBox.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deleteideaBox(_id) {
  return await ideaBox.findOneAndDelete({ _id });
}
*/
module.exports = {
  createideaBox,
  getAllideaBoxs,
  getideaBoxById,
  /*updateideaBox,
  deleteideaBox,*/
};
