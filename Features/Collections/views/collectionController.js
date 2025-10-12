const mongoose = require('mongoose');
const collectionService = require('../viewModels/collectionService');
const User = require('../../Authentification/models/user.model');
const TodoCollection = require('../models/TodoCollection');

const generateUniqueShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

exports.create = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Generate unique share code if collection is shared
    let shareCode = req.body.shareCode || null;
    if (req.body.isShared && !shareCode) {
      shareCode = generateUniqueShareCode();
    }

    const collection = new TodoCollection({
      title: req.body.title,
      category: req.body.category || 'Personal',
      categoryColor: req.body.categoryColor || 0xff2196F3,
      tags: req.body.tags || [],
      items: req.body.items || [],
      createdBy: userId,
      isShared: req.body.isShared || false,
      shareCode: shareCode, // Use the generated or provided share code
      members: req.body.members || []
    });

    await collection.save();

    res.status(201).json({
      message: 'Collection créée avec succès',
      collection: {
        id: collection._id,
        title: collection.title,
        category: collection.category,
        categoryColor: collection.categoryColor,
        tags: collection.tags,
        items: collection.items,
        createdBy: collection.createdBy,
        isShared: collection.isShared,
        shareCode: collection.shareCode,
        members: collection.members,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      }
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la collection', error });
  }
};

exports.getCollectionById = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const collection = await collectionService.getCollectionById(req.userId, collectionId);
    res.status(200).json(collection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCollections = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('🔄 Getting collections for user:', userId);
    
    const collections = await collectionService.getCollectionsByUser(userId);
    
    console.log(`✅ Found ${collections.length} collections for user ${userId}`);
    collections.forEach((collection, index) => {
      const isOwner = collection.createdBy.toString() === userId;
      const isMember = collection.members.some(m => m.userId.toString() === userId);
      console.log(`📁 Collection ${index}: ${collection.title}`);
      console.log(`   - Owner: ${isOwner}, Member: ${isMember}`);
      console.log(`   - Members: ${collection.members.length}`);
    });
    
    res.status(200).json(collections);
  } catch (err) {
    console.error('❌ Error getting collections:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.joinWithCode = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await collectionService.joinWithCode(req.userId, code);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const result = await collectionService.deleteCollection(req.params.id, req.userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await collectionService.updateCollection(req.userId, id, req.body);
    res.status(200).json({
      message: 'Collection updated successfully',
      collection: updated,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateListItem = async (req, res) => {
  try {
    const { collectionId, itemId } = req.params;
    const updatedItem = await collectionService.updateItem(req.userId, collectionId, itemId, req.body);
    res.status(200).json({
      message: 'Item updated successfully',
      item: updatedItem,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.createListItem = async (req, res) => {
  try {
    const { collectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({ message: 'Invalid collectionId' });
    }

    const item = await collectionService.createItem(req.userId, collectionId, req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error(err); // log the actual error
    res.status(500).json({ message: err.message });
  }
};

exports.getListsItem = async (req, res) => {
  try {
    const { collectionId } = req.params;
    if (!collectionId) {
      return res.status(400).json({ message: 'Collection ID is required in the URL' });
    }

    const items = await collectionService.getAllItems(req.userId, collectionId);
    res.status(200).json(items);
  } catch (err) {
    res.status(err.message === 'Collection not found' ? 404 : 500).json({ message: err.message });
  }
};


exports.getListsItemById = async (req, res) => {
  try {
    const { collectionId, itemId } = req.params;
    const item = await collectionService.getItemById(req.userId, collectionId, itemId);
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteListItem = async (req, res) => {
  try {
    const { collectionId, itemId } = req.params;
    const result = await collectionService.deleteItem(req.userId, collectionId, itemId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
