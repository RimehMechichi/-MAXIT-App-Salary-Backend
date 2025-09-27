const express = require('express');
const router = express.Router();
const avantageSociauxController = require('../views/avantageSociauxControllers.js');
const { uploadImages } = require('../middlewares/multer-config.js');


router.post('/avantageSociaux', uploadImages, avantageSociauxController.create);
router.get('/avantageSociaux', avantageSociauxController.getAll);
router.get('/avantageSociaux/:id', avantageSociauxController.getById);
router.put('/avantageSociaux/:id', avantageSociauxController.update);
router.delete('/avantageSociaux/:id', avantageSociauxController.delete);


module.exports = router;
