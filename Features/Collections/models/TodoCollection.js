const mongoose = require('mongoose');

const collectionMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  role: { type: String, enum: ['viewer','editor','owner','member'], default: 'editor' },
  email: String,           // optional
  displayName: String      // optional
});

const todoItemSchema = new mongoose.Schema({
  task: String,
  isDone: { type: Boolean, default: false },
  dueDate: Date,
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const todoCollectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Personal' },
  categoryColor: { type: Number, default: 0xff2196F3 }, // blue
  tags: [String],
  items: [todoItemSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isShared: { type: Boolean, default: false },
  shareCode: { type: String, unique: true, sparse: true },
  members: [collectionMemberSchema]
}, { timestamps: true });

module.exports = mongoose.model('TodoCollection', todoCollectionSchema);
