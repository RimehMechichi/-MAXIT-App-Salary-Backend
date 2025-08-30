const twilio = require('twilio');
 
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Remove the generateNumericOtp function
const generateNumericOtp = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
}