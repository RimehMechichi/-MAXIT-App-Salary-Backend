const comment = require('../models/commentsModels');

// Create
async function createcomments(data) {
  return await comment.create(data);
}

// Read All
async function getAllcomments() {
  return await comment.find();
}

// Read One
async function getcommentById(_id) {
  return await comment.findOne({ _id });
}

// Update
async function updatecomments(_id, data) {
  return await comment.findOneAndUpdate({ _id }, data, { new: true });
}

// Delete
async function deletecomments(_id) {
  return await comment.findOneAndDelete({ _id});
}

module.exports = {
  createcomments,
  getAllcomments,
  getcommentById,
  updatecomments,
  deletecomments,
};


