const config = require('../config/auth.config.js');
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { signUpEmailOptions, forgotPasswordEmailOptions } = require('../config/emailOptions.config.js');
const emailConfig = require('../config/email.config.js');
const db = require('../models/index.js');
const { USER_STATUS, ACCOUNT_STATUS } = require('../config/user.constants');
const axios = require('axios');
const twilio = require('twilio');
require('dotenv').config();

const User = db.user;
const Role = db.role;

// Generate reset token function
const generateResetToken = function () {
  const resetToken = jwt.sign({ data: 'resetToken' }, config.secret, { expiresIn: '1h' });
  return resetToken;
}

// Initialize the Twilio client using environment variables
let client;
let twilioPhoneNumber;
let twilioConfigured = false;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    twilioConfigured = true;
    console.log('✅ Twilio client configured successfully');
  } catch (error) {
    console.error('❌ Error creating Twilio client:', error.message);
    twilioConfigured = false;
  }
} else {
  console.warn('⚠️ Twilio credentials not found. OTP functionality will use demo mode.');
}

// In-memory storage for OTPs (use Redis in production)
// ✅ Initialize OTP store globally if not already set
if (!global.otpStore) {
  global.otpStore = new Map();
}

// Generate a 6-digit numeric OTP
const generateNumericOtp = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Store OTP with expiration (5 minutes)
const storeOtp = (phone, otp) => {
  const normalizedPhone = phone.startsWith('+') ? phone : `+216${phone}`;

  global.otpStore.set(normalizedPhone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  console.log(`🔢 OTP for ${normalizedPhone}: ${otp} (valid for 5 minutes)`);
};


exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log("📩 Incoming OTP verification request:", { phone, otp });

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // ✅ Always normalize the phone number before looking up
    const normalizedPhone = phone.startsWith('+') ? phone : `+216${phone}`;

    const storedOtpData = global.otpStore.get(normalizedPhone);
    console.log("📦 Stored OTP data:", storedOtpData);

    if (!storedOtpData) {
      console.log("❌ No OTP found for this phone:", normalizedPhone);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      console.log("⏳ OTP expired for:", normalizedPhone);
      global.otpStore.delete(normalizedPhone);
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedOtpData.otp !== otp) {
      console.log("❌ Invalid OTP provided");
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ✅ OTP is correct → remove it
    global.otpStore.delete(normalizedPhone);
    console.log("✅ OTP verified successfully for:", normalizedPhone);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error("🔥 Unexpected error in verifyOtp:", error);
    return res.status(500).json({ message: 'Error verifying OTP' });
  }
};


exports.signup = async (req, res) => {
  const {
    lastName,
    firstName,
    email,
    phone,
    picture,
    departement,
    password,
    jobTitle,
    soldeRestant,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const newUser = new User({
      lastName,
      firstName,
      email,
      phone,
      picture,
      departement,
      password: hashedPassword,
      jobTitle,
      soldeRestant: Number(soldeRestant), 
      statusUser: USER_STATUS.ACTIVE,
      statusCompte: ACCOUNT_STATUS.UNCONFIRMED,
    });

    await newUser.save();

    return res.status(201).json({ 
      message: 'User registered successfully.',
      soldeRestant: newUser.soldeRestant 
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.signin = async (req, res) => {
  try {
    let user;
    if (req.body.username) {
      user = await User.findOne({ username: req.body.username })
        .populate('roles', '-__v');
    }

    if (!user && req.body.email) {
      user = await User.findOne({ email: req.body.email })
        .populate('roles', '-__v');
    }

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400 
    });

    const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);

    req.session.token = token;

    res.status(200).send({
      id: user._id,
      username: user.username,
      name: user.lastName,
      firstName: user.firstName,
      email: user.email,
      roles: authorities,
      accessToken: token,
      soldeRestant: user.soldeRestant, 
    });

  } catch (error) {
    console.error('❌ Error signing in:', error);
    res.status(500).json({ message: 'Error signing in' });
  }
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account with that email exists, a reset link has been sent'
      });
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    
    await user.save({ validateModifiedOnly: true });

    const resetPasswordLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport(emailConfig);
    const mailOptions = forgotPasswordEmailOptions(email, resetPasswordLink);

    await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset email sent to:', email);
    return res.status(200).json({ 
      message: 'If an account with that email exists, a reset link has been sent',
      token: resetToken 
    });

  } catch (error) {
    console.error('❌ Error in forgotPassword:', error);
    return res.status(500).json({ message: 'Error processing password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    console.log('🔑 Received token:', token);

    if (!token || !newPassword || !confirmPassword) {
      console.log('❌ Validation failed: Missing fields.');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      console.log('❌ Validation failed: Passwords do not match.');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('📊 Database query result:', user);

    if (!user) {
      console.log('❌ Validation failed: Invalid or expired reset token.');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.statusUser = 'actif'; 
    user.statusCompte = 'non confirmé'; 

    user.password = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('❌ Error in resetPassword:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.forgotPasswordWithPhone = async (req, res) => {
  const { phone } = req.body;
  console.log('📞 Received forgot password request for phone:', phone);

  try {
    let cleanedPhone = phone;
    if (phone.startsWith('+216')) {
      cleanedPhone = phone.substring(4);
    }

    console.log('📱 Cleaned phone:', cleanedPhone);
    
    const user = await User.findOne({ phone: cleanedPhone });
    console.log('👤 User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('❌ No user found with phone:', cleanedPhone);
      return res.status(200).json({ 
        message: 'If an account with that phone number exists, a reset code has been sent.'
      });
    }
    
    const otp = generateNumericOtp();
    console.log('🔢 Generated OTP:', otp);
    
    storeOtp(cleanedPhone, otp);
    
    if (twilioConfigured && client) {
      console.log('✅ Twilio client is configured, attempting to send SMS...');
      try {
        const message = await client.messages.create({
          body: `Your OTP code is: ${otp}. Valid for 5 minutes.`,
          from: twilioPhoneNumber,
          to: phone 
        });
        console.log(`✅ OTP sent via Twilio to ${phone}: ${message.sid}`);
        return res.status(200).json({
          message: 'If an account with that phone number exists, a reset code has been sent.'
        });
      } catch (twilioError) {
        console.error('❌ Twilio error details:', twilioError);
        console.error('❌ Twilio error code:', twilioError.code);
        console.error('❌ Twilio error message:', twilioError.message);
        
        if (twilioError.code === 21608 || twilioError.code === 21408) {
          console.log('💡 Trial account restriction: You can only send messages to verified numbers');
          console.log('💡 Add your phone number to verified numbers in Twilio console');
        }
        
      }
    } else {
      console.log('⚠️ Twilio client not configured, using demo mode');
    }

    console.log(`🛠️ DEMO MODE: OTP for ${phone} is: ${otp}`);
    return res.status(200).json({ 
      message: 'If an account with that phone number exists, a reset code has been sent.',
      demoMode: true,
      demoOtp: otp, 
      note: 'Check server console for the OTP code as Twilio is not properly configured'
    });

  } catch (dbError) {
    console.error('❌ Database error in forgotPasswordWithPhone:', dbError);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.resetPasswordWithPhone = async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword } = req.body;

    if (!phone || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

const cleanedPhone = phone.startsWith('+216') ? phone.substring(4) : phone;
const user = await User.findOne({ phone: cleanedPhone }).select('+password');

    if (!user) {
      console.log('❌ User not found for phone:', phone);
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash and save new password
    user.password = bcrypt.hashSync(newPassword, 8);
    await user.save();

    console.log('🔑 New hashed password saved:', user.password);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Error in resetPasswordWithPhone:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};exports.resetPasswordWithPhone = async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword } = req.body;

    if (!phone || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const cleanedPhone = phone.startsWith('+216') ? phone.substring(4) : phone;
    const user = await User.findOne({ phone: cleanedPhone }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash and save new password, skip required field validation
    user.password = bcrypt.hashSync(newPassword, 8);
    await user.save({ validateBeforeSave: false });

    console.log('🔑 New hashed password saved:', user.password);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Error in resetPasswordWithPhone:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.sendOtp = async (req, res) => { 
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    const otp = generateNumericOtp();
    
    storeOtp(formattedPhone, otp);
    
    if (twilioConfigured && client) {
      try {
        const message = await client.messages.create({
          body: `Your OTP code is: ${otp}. Valid for 5 minutes.`,
          from: twilioPhoneNumber,
          to: formattedPhone
        });
        console.log(`✅ OTP sent via Twilio to ${formattedPhone}: ${message.sid}`);
        return res.json({ success: true, message: 'OTP sent successfully' });
      } catch (twilioError) {
        console.error('❌ Twilio error:', twilioError);
      }
    }

    console.log(`🛠️ DEMO MODE: OTP for ${formattedPhone} is: ${otp}`);
    res.json({ 
      success: true, 
      message: 'OTP generated (demo mode)', 
      demoOtp: otp,
      demoMode: true 
    });

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};
