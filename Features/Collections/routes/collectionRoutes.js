const express = require('express');
const router = express.Router();

const collectionController = require('../views/collectionController');
const authJwt = require('../../Authentification/middlewares/auth.middleware');

// Items first (more specific)
router.get('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.getListsItemById);
router.get('/user/:userId', authJwt.verifyToken, collectionController.getCollections);
router.post('/:collectionId/items', authJwt.verifyToken, collectionController.createListItem);
router.delete('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.deleteListItem);
router.put('/:id', authJwt.verifyToken, collectionController.updateCollection);

// ITEMS
router.get('/:collectionId/items', authJwt.verifyToken, collectionController.getListsItem);
router.get('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.getListsItemById);
router.post('/:collectionId/items', authJwt.verifyToken, collectionController.createListItem);
router.put('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.updateListItem);
router.delete('/:collectionId/items/:itemId', authJwt.verifyToken, collectionController.deleteListItem);
module.exports = router;