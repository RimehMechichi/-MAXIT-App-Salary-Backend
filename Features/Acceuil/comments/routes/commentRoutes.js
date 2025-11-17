const express = require('express');
const router = express.Router();
const commentController = require('../views/commentControllers.js');
const { uploadSingleImage } = require('../middlewares/multer-config.js');

<<<<<<< HEAD

router.post('/comment', uploadSingleImage, commentController.create);
router.get('/comments', commentController.getAll);
router.get('/comment/:id', commentController.getById);
router.put('/comment/:id', commentController.update);
router.delete('/comment/:id', commentController.delete);


module.exports = router;
=======
// Remove '/acceuil' from the routes
router.post('/comment/:id', uploadSingleImage, commentController.addCommentToAcceuilItem);
router.get('/comments/:id', commentController.getCommentsForAcceuilItem);
router.get('/comments', commentController.getAll);
router.put('/comment/update/:commentId', commentController.update);
router.delete('/comment/delete/:commentId', commentController.delete);

module.exports = router;
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
