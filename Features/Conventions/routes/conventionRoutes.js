const express = require('express');
const router = express.Router();
const conventionController = require('../views/conventionController.js');

router.post('/convention', conventionController.create);
router.get('/conventions', conventionController.getAll);
router.get('/convention/:id', conventionController.getById);
router.put('/convention/:id', conventionController.update);
router.delete('/convention/:id', conventionController.delete);


module.exports = router;
