const express = require('express');
const router = express.Router();
const likeController = require('../views/likeControllers.js');


router.post('/like', ulikeController.create);
router.get('/likes', likeController.getAll);
router.get('/like/:id', likeController.getById);
router.put('/like/:id', likeController.update);
router.delete('/like/:id', likeController.delete);


module.exports = router;
