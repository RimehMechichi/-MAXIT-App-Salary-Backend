const express = require('express');
const router = express.Router();
const annuaireController = require('../views/annuairesController.js');

router.get('/annuaire', annuaireController.getAll);
router.get('/annuaire/:id', annuaireController.getById);

module.exports = router;
