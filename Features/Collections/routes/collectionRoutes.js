const express = require('express');
const router = express.Router();

const collectionController = require('../views/collectionController');
const authJwt = require('../../Authentification/middlewares/auth.middleware');

// Collection routes
router.get('/user/:userId', authJwt.verifyToken, collectionController.getCollections);
router.post('/', authJwt.verifyToken, collectionController.create);
router.put('/:id', authJwt.verifyToken, collectionController.updateCollection);
router.delete('/:id', authJwt.verifyToken, collectionController.deleteCollection); // ✅ ADD THIS

// Item routes - more specific routes first
router.get('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.getListsItemById);
router.get('/:collectionId/items', authJwt.verifyToken, collectionController.getListsItem);
router.post('/:collectionId/items', authJwt.verifyToken, collectionController.createListItem);
router.put('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.updateListItem);
router.delete('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.deleteListItem);

module.exports = router;