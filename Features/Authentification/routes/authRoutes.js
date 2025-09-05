const express = require('express');
const router = express.Router();

const { uploadSingleImage } = require('../middlewares/multer-config.js');

const { 
  signup, 
  signin, 
  signout, 
  forgotPassword, 
  resetPassword, 
  forgotPasswordWithPhone,
  verifyOtp,
  resetPasswordWithPhone ,
  sendOtp
} = require("../views/authControllers.js");

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

router.post('/signup', uploadSingleImage, signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/forgot-password-phone', forgotPasswordWithPhone);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password-with-phone', resetPasswordWithPhone); // <-- Correct Route

module.exports = router;
