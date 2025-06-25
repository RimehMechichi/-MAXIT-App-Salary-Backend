const express = require('express');
const router = express.Router();
const partenariatController = require('../views/partenariatControllers.js');

router.post('/partenariat', partenariatController.create);
router.get('/partenariat', partenariatController.getAll);
router.get('/partenariat/:id', partenariatController.getById);
router.put('/partenariat/:id', partenariatController.update);
router.delete('/partenariat/:id', partenariatController.delete);

module.exports = router;
