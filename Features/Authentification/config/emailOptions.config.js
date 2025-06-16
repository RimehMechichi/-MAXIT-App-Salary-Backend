// emailOptions.config.js

const signUpEmailOptions = {
  from: 'rimehmechichi08@gmail.com',
  subject: 'App Salary MAXIT',
  html: `
    <p>Hello Admin,</p>
    <p>A new user has registered:</p>
    <p>Username: {{username}}</p>
    <p>Email: {{email}}</p>
  `,
};

const forgotPasswordEmailOptions = (email, resetPasswordLink) => ({
  from: 'rimehmechichi06@gmail.com',
  to: email,
  subject: 'Réinitialisation de mot de passe',
  html: `
    <p>Bonjour,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <p>Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :</p>
    <a href="${resetPasswordLink}">${resetPasswordLink}</a>
    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
  `,
});

const userConfirmationEmailOptions = (user) => ({
  from: 'rimehmechichi06@gmail.com',
  to: user.email,
  subject: 'App Salary New User Confirmation',
  html: `
    <p>Hello ${user.firstName} ${user.name},</p>
    <p>Welcome to TRIPY, you have been confirmed by admin</p>
    <p>You can now log in our application and discover our services</p>
  `,
});

// Export all of them here
module.exports = {
  signUpEmailOptions,
  forgotPasswordEmailOptions,
  userConfirmationEmailOptions,
};
