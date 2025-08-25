const express = require('express');
const router = express.Router();
const commentController = require('../views/commentControllers.js');
const { uploadSingleImage } = require('../middlewares/multer-config.js');


router.post('/comment', uploadSingleImage, commentController.create);
router.get('/comments', commentController.getAll);
router.get('/comment/:id', commentController.getById);
router.put('/comment/:id', commentController.update);
router.delete('/comment/:id', commentController.delete);


module.exports = router;
