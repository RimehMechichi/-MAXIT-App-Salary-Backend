const express = require('express');
const router = express.Router();
const { signup, signin, signout, forgotPassword, resetPassword } = require("../views/authControllers.js");

// Middleware CORS header (optionnel ici)
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

// Routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Exporter le router
module.exports = router;
