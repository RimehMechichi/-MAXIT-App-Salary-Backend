const service = require('../viewModels/avantageSociauxServices.js');

exports.create = async (req, res) => {
  try {

    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { titre_AS, description_AS, date_AS } = req.body;

    // ✅ Une image unique
    const singleImage = req.files['image_AS'] ? `/images/${req.files['image_AS'][0].filename}` : null;

    // ✅ Plusieurs images
    const multipleImages = req.files['images_AS']
      ? req.files['images_AS'].map(file => `/images/${file.filename}`)
      : [];

    // Validation check - all fields required including at least one image
    if (!titre_AS || !description_AS || !date_AS || (!singleImage && multipleImages.length === 0)) {
      return res.status(400).json({ message: 'All fields are required, including at least one image' });
    }

    const newAvantage = await service.createavantageSociaux({
      titre_AS,
      description_AS,
      date_AS,
      image_AS: singleImage,    
      images_AS: multipleImages,  
    });

    res.status(201).json(newAvantage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const avantageSociauxs = await service.getAllavantageSociaux();
    res.json(avantageSociauxs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const avantageSociaux = await service.getavantageSociauxById(req.params.id);
    if (!avantageSociaux) return res.status(404).json({ message: 'avantageSociaux not found' });
    res.json(avantageSociaux);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.updateavantageSociaux(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'avantageSociauxs not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteavantageSociaux(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'avantageSociauxs not found' });
    res.json({ message: 'avantageSociauxs deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};