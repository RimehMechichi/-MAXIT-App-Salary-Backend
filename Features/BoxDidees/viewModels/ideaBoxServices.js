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
async function getideaBoxById(idideaBox) {
  return await ideaBox.findOne({ idideaBox });
}
/*
// Update
async function updateideaBox(idideaBox, data) {
  return await ideaBox.findOneAndUpdate({ idideaBox }, data, { new: true });
}

// Delete
async function deleteideaBox(idideaBox) {
  return await ideaBox.findOneAndDelete({ idideaBox });
}
*/
module.exports = {
  createideaBox,
  getAllideaBoxs,
  getideaBoxById,
  /*updateideaBox,
  deleteideaBox,*/
};
