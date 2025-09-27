const cron = require('node-cron');
const Conge = require('../models/congeModel');
const User = require('/Users/Asus/Desktop/StagePFE/appsalary-backend/Features/Authentification/models/user.model.js');

// Run every 1st of the month at 00:00
cron.schedule('0 0 1 * *', async () => {
  try {
    const users = await User.find();
    const now = new Date();

    // previous month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    for (const user of users) {
      const absences = await Conge.find({
        userId: user._id, // ✅ fixed field
        statut: 'Approuvé', // ✅ count only approved
        dateDebut: { $gte: startOfMonth, $lte: endOfMonth },
      });

      // ✅ business rule: reward if no approved absences
      const gain = absences.length === 0 ? 3 : 2;

      user.soldeRestant = Math.min((user.soldeRestant || 0) + gain, 25);
      await user.save();
    }

    console.log('✅ Solde mensuel mis à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du solde mensuel:', error);
  }
});
