const express = require('express');
const router = express.Router();
const commentController = require('../views/commentControllers.js');
const { uploadSingleImage } = require('../middlewares/multer-config.js');

// Remove '/acceuil' from the routes
router.post('/comment/:id', uploadSingleImage, commentController.addCommentToAcceuilItem);
router.get('/comments/:id', commentController.getCommentsForAcceuilItem);
router.get('/comments', commentController.getAll);
router.put('/comment/update/:commentId', commentController.update);
router.delete('/comment/delete/:commentId', commentController.delete);

module.exports = router;