const express = require('express');
const router = express.Router();
const likeController = require('../views/likeControllers.js');


// Like a post
router.post('/like/:id', likeController.likePost);

// Dislike a post (remove like)
router.delete('/dislike/:id', likeController.dislikePost);

// Get likes for an item
router.get('/likes/:id', likeController.getLikesForItem);

// Get like count for an item
router.get('/like-count/:id', likeController.getLikeCount);


module.exports = router;
