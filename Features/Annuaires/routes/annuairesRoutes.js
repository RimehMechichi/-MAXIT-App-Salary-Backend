const express = require('express');
const router = express.Router();
const annuaireController = require('../views/annuairesController.js');

router.post('/annuaire', annuaireController.create);
router.get('/annuaires', annuaireController.getAll);
router.get('/annuaire/:id', annuaireController.getById);
router.put('/annuaire/:id', annuaireController.update);
router.delete('/annuaire/:id', annuaireController.delete);


module.exports = router;
