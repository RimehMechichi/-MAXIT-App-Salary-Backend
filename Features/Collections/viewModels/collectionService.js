const mongoose = require('mongoose');
const TodoCollection = require('../models/TodoCollection');
const TodoItem = require('../models/TodoItem');
const User = require('../../Authentification/models/user.model');

// ===== COLLECTIONS =====
const generateUniqueShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

async function createCollection(userId, data) {
  if (typeof data === 'string') data = JSON.parse(data);

  const user = await User.findById(userId);
  if (!user) throw new Error('Creator not found');

  // Generate unique share code if collection is shared
  let shareCode = data.shareCode || null;
  if (data.isShared && !shareCode) {
    shareCode = generateUniqueShareCode();
  }

  const collection = new TodoCollection({
    ...data,
    shareCode: shareCode, // Add the share code here
    createdBy: userId,
    members: [
      {
        userId,
        role: 'owner',
        status: 'accepted',
        email: user.email,
        displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      },
      ...(data.members || []),
    ],
  });

  return await collection.save();
}

async function getCollectionById(userId, collectionId) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  const isMember =
    collection.createdBy.toString() === userId.toString() ||
    collection.members.some(
      m => m.userId.toString() === userId.toString() && m.status === 'accepted'
    );
  if (!isMember) throw new Error('Permission denied');

  const items = await TodoItem.find({ collectionId: collection._id });
  return { ...collection.toObject(), items };
}

async function getCollectionsByUser(userId) {
  console.log('🔍 Getting collections for user:', userId);
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const _id = new mongoose.Types.ObjectId(userId);

  const collections = await TodoCollection.find({
    $or: [
      { createdBy: _id },
      { 'members.userId': _id, 'members.status': 'accepted' }
    ]
  });

  console.log(`📊 Found ${collections.length} total collections for user ${userId}`);
  
  collections.forEach((collection, index) => {
    const isOwner = collection.createdBy.toString() === userId;
    const isMember = collection.members.some(m => 
      m.userId.toString() === userId && m.status === 'accepted'
    );
    
    console.log(`📋 Collection ${index}: ${collection.title}`);
    console.log(`   - ID: ${collection._id}`);
    console.log(`   - Created by: ${collection.createdBy}`);
    console.log(`   - Is owner: ${isOwner}`);
    console.log(`   - Is member: ${isMember}`);
    console.log(`   - Members count: ${collection.members.length}`);
    console.log(`   - Member IDs: ${collection.members.map(m => m.userId.toString())}`);
  });

  return collections;
}


async function joinWithCode(userId, code) {
  const collection = await TodoCollection.findOne({ shareCode: code });
  if (!collection) throw new Error('Collection not found');

  const alreadyMember = collection.members.some(
    m => m.userId.toString() === userId.toString()
  );
  if (alreadyMember) throw new Error('User already in this collection');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  collection.members.push({
    userId: user._id,
    email: user.email,
    displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    role: 'member',
    status: 'accepted',
  });

  return await collection.save();
}

async function updateCollection(userId, collectionId, data) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  // Only the owner can update the collection
  if (collection.createdBy.toString() !== userId.toString()) {
    throw new Error('Only the owner can update this collection');
  }

  // Apply allowed updates
  const allowedFields = ['title', 'category', 'categoryColor', 'tags', 'isShared', 'members'];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) collection[field] = data[field];
  });

  await collection.save();
  return collection;
}

async function deleteCollection(collectionId, userId) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  if (collection.createdBy.toString() !== userId.toString()) {
    throw new Error('Only the owner can delete this collection');
  }

  await TodoCollection.deleteOne({ _id: collectionId });
  await TodoItem.deleteMany({ collectionId });
  return { message: 'Collection deleted successfully' };
}

// ===== LIST ITEMS =====
async function createItem(userId, collectionId, data) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  const isMember =
    collection.createdBy.toString() === userId.toString() ||
    collection.members.some(
      m => m.userId.toString() === userId.toString() && m.status === 'accepted'
    );
  if (!isMember) throw new Error('Permission denied');

  if (!data.task || typeof data.task !== 'string') {
    throw new Error('Task is required and must be a string');
  }

  const item = new TodoItem({
    ...data,
    collectionId,
    createdBy: userId,
  });

  return await item.save();
}


async function getAllItems(userId, collectionId) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  // Permission check
  const isMember =
    collection.createdBy.toString() === userId.toString() ||
    collection.members.some(
      m => m.userId.toString() === userId.toString() && m.status === 'accepted'
    );
  if (!isMember) throw new Error('Permission denied');

  // === FETCH ITEMS HERE ===
  const items = await TodoItem.find({ collectionId });
  return items;
}


async function getItemById(userId, collectionId, itemId) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  const isMember =
    collection.createdBy.toString() === userId.toString() ||
    collection.members.some(m => m.userId.toString() === userId.toString() && m.status === 'accepted');
  if (!isMember) throw new Error('Permission denied');

  const item = await TodoItem.findById(itemId);
  if (!item) throw new Error('Item not found');
  if (item.collectionId.toString() !== collectionId.toString())
    throw new Error('Item does not belong to this collection');

  return item;
}

async function deleteItem(userId, collectionId, itemId) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  if (collection.createdBy.toString() !== userId.toString()) {
    throw new Error('Only the owner can delete items');
  }

  const item = await TodoItem.findByIdAndDelete(itemId);
  if (!item) throw new Error('Item not found');

  return { message: 'Item deleted successfully' };
}


async function updateItem(userId, collectionId, itemId, data) {
  const collection = await TodoCollection.findById(collectionId);
  if (!collection) throw new Error('Collection not found');

  // Check if user is owner or accepted member
  const isMember =
    collection.createdBy.toString() === userId.toString() ||
    collection.members.some(
      (m) => m.userId.toString() === userId.toString() && m.status === 'accepted'
    );
  if (!isMember) throw new Error('Permission denied');

  const item = await TodoItem.findById(itemId);
  if (!item) throw new Error('Item not found');

  if (item.collectionId.toString() !== collectionId.toString()) {
    throw new Error('Item does not belong to this collection');
  }

  // Apply allowed updates
  const allowedFields = ['task', 'description', 'dueDate', 'priority', 'isDone'];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) item[field] = data[field];
  });

  await item.save();
  return item;
}

module.exports = {
  createCollection,
  getCollectionsByUser,
  getCollectionById,
  joinWithCode,
  deleteCollection,
  createItem,
  getAllItems,
  getItemById,
  deleteItem,
  updateCollection, 
  updateItem,       
};
