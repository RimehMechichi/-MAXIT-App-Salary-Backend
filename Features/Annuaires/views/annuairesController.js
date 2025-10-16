const service = require('../viewModels/annuairesService');
const User = require('/Users/Asus/Desktop/StagePFE/appsalary-backend/Features/Authentification/models/user.model.js');

exports.create = async (req, res) => {
  try {
    const userId = req.params.userId; 
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const annuaire = new Annuaire({
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      direction: user.direction
    });

    await annuaire.save();
    res.status(201).json(annuaire);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

exports.getAll = async (req, res) => {
  try {
    const annuaires = await service.getAllannuaires();
    res.json(annuaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const annuaire = await service.getannuaireById(req.params.id);
    if (!annuaire) return res.status(404).json({ message: 'annuaire not found' });
    res.json(annuaire);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updateannuaires(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'annuaires not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteannuaires(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'annuaires not found' });
    res.json({ message: 'annuaires deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllFromUsers = async (req, res) => {
  try {
    const users = await User.find();

    const annuaires = users.map(user => ({
      _id: user._id,
      rapportId: user.rapportId || `ORG-${user._id}`, 
      name: `${user.firstName} ${user.lastName}`, 
      role: user.jobTitle, 
      email: user.email,
      phone: user.phone,
      direction: user.departement,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      __v: user.__v
    }));

    res.json(annuaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
