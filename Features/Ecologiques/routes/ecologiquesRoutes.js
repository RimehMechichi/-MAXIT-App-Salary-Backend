const express = require('express');
const router = express.Router();
const ecologiqueController = require('../views/ecologiqueControllers.js');
const { uploadSingleImage } = require('../middlewares/multer-config.js');


router.post('/ecologique', uploadSingleImage, ecologiqueController.create);
router.get('/ecologiques', ecologiqueController.getAll);
router.get('/ecologique/:id', ecologiqueController.getById);
router.put('/ecologique/:id', ecologiqueController.update);
router.delete('/ecologique/:id', ecologiqueController.delete);


module.exports = router;
