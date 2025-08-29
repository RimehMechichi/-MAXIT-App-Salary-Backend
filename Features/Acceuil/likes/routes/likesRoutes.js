const express = require('express');
const router = express.Router();
const likeController = require('../views/likeControllers.js');

// Remove '/acceuil' from the routes
router.post('/like/:id', likeController.likeAcceuilItem);
router.delete('/dislike/:id', likeController.dislikeAcceuilItem);
router.get('/likes/:id', likeController.getLikesForAcceuilItem);
router.get('/likes', likeController.getAll);
router.delete('/like/:id', likeController.delete);

module.exports = router;