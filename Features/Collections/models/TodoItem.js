const mongoose = require('mongoose');

const todoItemSchema = new mongoose.Schema({
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TodoCollection', required: true },
  task: { type: String, required: true },
  isDone: { type: Boolean, default: false },
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('TodoItem', todoItemSchema);
