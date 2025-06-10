const express = require('express');
const router = express.Router();
const ecologiqueController = require('../views/ecologiqueControllers.js');

router.post('/ecologique', ecologiqueController.create);
router.get('/ecologiques', ecologiqueController.getAll);
router.get('/ecologique/:id', ecologiqueController.getById);
router.put('/ecologique/:id', ecologiqueController.update);
router.delete('/ecologique/:id', ecologiqueController.delete);


module.exports = router;
