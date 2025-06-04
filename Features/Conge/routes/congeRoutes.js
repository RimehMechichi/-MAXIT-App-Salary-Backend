const express = require('express');
const router = express.Router();
const congeController = require('../views/congeController.js');

router.post('/conge', congeController.create);
router.get('/conge', congeController.getAll);
router.get('/conge/:id', congeController.getById);
router.put('/conge/:id', congeController.update);
router.delete('/conge/:id', congeController.delete);

module.exports = router;
