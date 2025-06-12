import config from '../config/auth.config.js'
import db from "../models/index.js";
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { signUpEmailOptions, forgotPasswordEmailOptions } from '../config/emailOptions.config.js';
import emailConfig from '../config/email.config.js';


const User = db.user;
const Role = db.role;

export async function signup(req, res) {
  const { name, firstName, username, email, password, modePaiement, rib } = req.body;
  const adminEmail = "belhadjo1999@gmail.com"
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.statusCompte === 'bloqué') {
        return res.status(409).json({ message: 'Account is blocked. Contact administrator for assistance.' });
      }
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      firstName,
      username,
      email,
      password: bcrypt.hashSync(password, 8),
      modePaiement,
      rib
    });
    user.statusUser = 'nonConfirmé';
    user.statusCompte = 'actif';

    await user.save();

    const roles = await Role.find({ name: { $in: req.body.roles } }).exec();

    if (!roles) {
      return res.status(500).json({ message: 'Error finding roles' });
    }

    user.roles = roles.map(role => role._id);
    await user.save();

    const transporter = nodemailer.createTransport(emailConfig);

    const mailOptions = {
      from: signUpEmailOptions.from,
      to: adminEmail,
      subject: signUpEmailOptions.subject,
      html: signUpEmailOptions.html.replace('{{username}}', username).replace('{{email}}', email),
    };


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent: ' + info.response);
    });
    res.json({ message: 'User registration successful. Confirmation email sent.' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error registering user' });
  }
};


export async function signin(req, res) {
  try {
    const user = await User.findOne({ username: req.body.username })
      .populate('roles', '-__v');

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.statusUser === 'nonConfirmé') {
      return res.status(401).send({ message: 'Account not confirmed yet' });
    }

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



export async function signout(req, res) {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

export async function forgotPassword(req, res) {
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

export async function resetPassword(req, res) {
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

export function generateResetToken() {
  const resetToken = jwt.sign({ data: 'resetToken' }, 'projetPI-secret-key', { expiresIn: '1h' });
  return resetToken;
}

