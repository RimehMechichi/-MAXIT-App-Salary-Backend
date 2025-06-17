const config = require( '../config/auth.config.js');
const nodemailer = require ('nodemailer');
const jwt = require ("jsonwebtoken");
const bcrypt = require ("bcryptjs");
const { signUpEmailOptions, forgotPasswordEmailOptions } = require ('../config/emailOptions.config.js');
const emailConfig = require ('../config/email.config.js');
const db = require('../models/index.js');

const User = db.user;
const Role = db.role;
/*
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

  const adminEmail = "rimehmechichi08@gmail.com";

  try {
    const existingUser = await User.find({ email });

    if (existingUser) {
      if (existingUser.statusCompte === 'bloqué') {
        return res.status(409).json({ message: 'Account is blocked. Contact administrator for assistance.' });
      }
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
      statusUser: 'Confirmé',
      statusCompte: 'actif',
    });


    const roles = await Role.find({ name: { $in: req.body.roles } }).exec();

    if (!roles) {
     return res.status(500).json({ message: 'Error finding roles' });
    }

    User.roles = roles.map(role => role._id);
    await newUser.save();
    
    // Envoi mail à l'admin
    const transporter = nodemailer.createTransport(emailConfig);
    const mailOptions = {
      from: signUpEmailOptions.from,
      to: adminEmail,
      subject: signUpEmailOptions.subject,
      html: signUpEmailOptions.html
        .replace('{{username}}', firstName + ' ' + lastName)
        .replace('{{email}}', email),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return res.status(201).json({ message: 'User registered. Confirmation email sent.' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'User saved but email failed to send.' });
    }

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
*/

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
    console.log("✅ Type de User.findOne:", typeof User.findOne); 

  try {
    const existingUser = await User.findOne({ email });
    console.log("🕵️‍♀️ Existing user trouvé ?", existingUser);

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
      statusUser: 'Confirmé',
      statusCompte: 'actif',
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully.' });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



exports.signin  = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username })
      .populate('roles', '-__v');

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
/*
    if (user.statusUser === 'nonConfirmé') {
      return res.status(401).send({ message: 'Account not confirmed yet' });
    }*/

    if (user.statusCompte === 'bloqué') {
      return res.status(401).send({ message: 'Account is blocked' });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 });

    const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);

    req.session.token = token;

    res.status(200).send({
      id: user._id,
      username: user.username,
      name: user.name,
      firstName: user.firstName,
      email: user.email,
      roles: authorities,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error signing in' });
  }
};



exports.signout = async  (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

exports.forgotPassword = async  (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user.username)
    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    const resetPasswordLink = `http://localhost:4200/forget/${resetToken}`;

    await user.save();

    const transporter = nodemailer.createTransport(emailConfig);
    const mailOptions = forgotPasswordEmailOptions(email, resetPasswordLink);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent: ' + info.response);
      res.json({ message: 'User registration successful. Confirmation email sent to admin.' });
    });
    res.json({ resetToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.resetPassword = async  (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    console.log("=>", user.username)
    user.password = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.generateResetToken = function () {
  const resetToken = jwt.sign({ data: 'resetToken' }, 'projetPI-secret-key', { expiresIn: '1h' });
  return resetToken;
}

