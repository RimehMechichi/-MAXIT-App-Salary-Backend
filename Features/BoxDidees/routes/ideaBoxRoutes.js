const express = require('express');
const router = express.Router();
const ideaBoxController = require('../views/ideaBoxController.js');

router.post('/ideaBox', ideaBoxController.create);
router.get('/ideaBox', ideaBoxController.getAll);
router.get('/ideaBox/:id', ideaBoxController.getById);
/*
router.put('/ideaBox/:id', ideaBoxController.update);
router.delete('/ideaBox/:id', ideaBoxController.delete);
*/
module.exports = router;
