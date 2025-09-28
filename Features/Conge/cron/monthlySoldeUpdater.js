const cron = require('node-cron');
const Conge = require('../models/congeModel');
const User = require('/Users/Asus/Desktop/StagePFE/appsalary-backend/Features/Authentification/models/user.model.js');

cron.schedule('0 0 1 * *', async () => {
  const users = await User.find();

  for (const user of users) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const absences = await Conge.find({
      idUser: user._id,
      dateDebut: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const gain = absences.length === 0 ? 3 : 2;

    user.soldeRestant += gain;
    if (user.soldeRestant > 25) user.soldeRestant = 25;

    await user.save();
  }

  console.log('✅ Solde mensuel mis à jour avec succès');
});
