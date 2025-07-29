const express = require('express');
const router = express.Router();
const congeController = require('../views/congeController.js');
const { uploadSingleFile } = require('../middlewares/multer-config.js');

router.post('/conge', uploadSingleFile, congeController.create);
router.get('/conge', congeController.getAll);
router.get('/conge/:id', congeController.getById);
router.get('/conge/user/:userId', congeController.getByUser);
router.put('/conge/:id', congeController.update);
router.delete('/conge/:id', congeController.delete);

module.exports = router;
