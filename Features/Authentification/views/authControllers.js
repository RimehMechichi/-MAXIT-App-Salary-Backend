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
  const resetToken = jwt.sign({ data: 'resetToken' }, 'projetPI-secret-key', { expiresIn: '1h' });
  return resetToken;
}
// Initialize the Twilio client using environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;


// Generate a 6-digit numeric OTP
const generateNumericOtp = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
      statusUser: USER_STATUS.ACTIVE,
      statusCompte: ACCOUNT_STATUS.UNCONFIRMED,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully.' });

  } catch (error) {
    console.error('Signup error:', error);
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
    });

  } catch (error) {
    console.error('Error signing in:', error);
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

    const resetPasswordLink = `${process.env.FRONTEND_URL || 'http://192.168.0.97:8080'}/api/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport(emailConfig);
    const mailOptions = forgotPasswordEmailOptions(email, resetPasswordLink);

    await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent to:', email);
    return res.status(200).json({ 
      message: 'If an account with that email exists, a reset link has been sent',
      token: resetToken 
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json({ message: 'Error processing password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    console.log('Received token:', token);

    if (!token || !newPassword || !confirmPassword) {
      console.log('Validation failed: Missing fields.');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      console.log('Validation failed: Passwords do not match.');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('Database query result:', user);

    if (!user) {
      console.log('Validation failed: Invalid or expired reset token.');
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
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.forgotPasswordWithPhone = async (req, res) => {
    const { phone } = req.body;

    try {
        const user = await User.findOne({ phone: phone });

        if (!user) {
            return res.status(200).json({ 
                message: 'If an account with that phone number exists, a reset code has been sent.'
            });
        }
        
        const resetCode = generateNumericOtp();
        user.resetToken = resetCode;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save({ modifiedOnly: true });

        // Attempt to send the SMS
        try {
            await client.messages.create({
                body: `Your password reset code is: ${resetCode}`,
                to: phone,
                from: twilioPhoneNumber,
            });

            console.log(`[SMS Service] SMS sent successfully to ${phone}`);
            
            // Send a success response. Do not include the OTP in the response body.
            return res.status(200).json({
                message: 'If an account with that phone number exists, a reset code has been sent.'
            });

        } catch (apiError) {
            // Log the specific Twilio API error and send a 500 response
            console.error(`[SMS Service] Failed to send SMS via Twilio:`, apiError.message);
            console.error(`[Twilio Error Code]`, apiError.code);
            return res.status(500).json({
                message: 'Error sending SMS. Please try again later.'
            });
        }

    } catch (dbError) {
        console.error('Database error in forgotPasswordWithPhone:', dbError);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

