const express = require('express');
const router = express.Router();

// Destructure the uploadSingleImage middleware from the multer-config module
const { uploadSingleImage } = require('../middlewares/multer-config.js');

const { signup, signin, signout, forgotPassword, resetPassword } = require("../views/authControllers.js");

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

router.post('/signup', uploadSingleImage, signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
