const express = require('express');
const router = express.Router();
const commentController = require('../views/commentControllers.js');
const { uploadSingleImage } = require('../middlewares/multer-config.js');


router.post('/comment/:id', commentController.addComment);
router.get('/comments/:id', commentController.getCommentsForItem);
router.put('/comment/:id', commentController.updateComment);
router.delete('/comment/:id', commentController.deleteComment);
router.get('/comment-count/:id', commentController.getCommentCount);

module.exports = router;
