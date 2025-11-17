const comment = require('../models/commentsModels');

<<<<<<< HEAD
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
=======
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
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
async function updatecomments(_id, data) {
  return await comment.findOneAndUpdate({ _id }, data, { new: true });
}

<<<<<<< HEAD
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


=======
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
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
