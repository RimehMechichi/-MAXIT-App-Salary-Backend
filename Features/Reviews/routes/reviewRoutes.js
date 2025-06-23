const express = require('express');
const router = express.Router();
const reviewController = require('../views/reviewControllers.js');

//router.post('/review', reviewController.create);
router.get('/reviews', reviewController.getAll);
router.get('/review/:id', reviewController.getById);
//router.put('/review/:id', reviewController.update);
router.delete('/review/:id', reviewController.delete);


module.exports = router;
