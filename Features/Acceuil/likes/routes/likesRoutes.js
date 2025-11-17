const express = require('express');
const router = express.Router();
const likeController = require('../views/likeControllers.js');

<<<<<<< HEAD

router.post('/like', likeController.create);
router.get('/likes', likeController.getAll);
router.get('/like/:id', likeController.getById);
router.put('/like/:id', likeController.update);
router.delete('/like/:id', likeController.delete);


module.exports = router;
=======
// Remove '/acceuil' from the routes
router.post('/like/:id', likeController.likeAcceuilItem);
router.delete('/dislike/:id', likeController.dislikeAcceuilItem);
router.get('/likes/:id', likeController.getLikesForAcceuilItem);
router.get('/likes', likeController.getAll);
router.delete('/like/:id', likeController.delete);

module.exports = router;
>>>>>>> 0b30cc498cfcaa71703412191b0387e1e9b31496
