const service = require('../viewModels/ecologiqueServices.js');

exports.create = async (req, res) => {
  try {
    const { titre_eventEco, description_eventEco, date_eventEco, planning } = req.body;

    // Parse planning if it's a stringified array (from form-data)
    const parsedPlanning = typeof planning === 'string' ? JSON.parse(planning) : planning;

    // Handle single main image
    const image_eventEco = req.files['image_eventEco']?.[0]?.filename
      ? `/images/${req.files['image_eventEco'][0].filename}`
      : null;

    // Handle multiple additional images
    const images = req.files['images']?.map(file => `/images/${file.filename}`) || [];

    // Validate required fields
    if (!titre_eventEco || !description_eventEco || !date_eventEco || !image_eventEco) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const newEvent = await service.createecologiques({
      titre_eventEco,
      description_eventEco,
      planning: parsedPlanning,
      date_eventEco,
      image_eventEco,
      images,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};


exports.getAll = async (req, res) => {
  try {
    const ecologiques = await service.getAllecologiques();
    res.json(ecologiques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const ecologique = await service.getecologiqueById(req.params.id);
    if (!ecologique) return res.status(404).json({ message: 'ecologique not found' });
    res.json(ecologique);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      titre_eventEco,
      description_eventEco,
      planning,
      date_eventEco,
    } = req.body;

    const eventId = req.params.id;
    const existingEvent = await service.getecologiqueById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // ✅ Main image update (if uploaded)
    const newMainImage = req.files?.image_eventEco?.[0];
    const image_eventEco = newMainImage
      ? `/images/${newMainImage.filename}`
      : existingEvent.image_eventEco;

    // ✅ Additional images update (if uploaded)
    const newImages = req.files?.images?.map(file => `/images/${file.filename}`);
    const images = newImages && newImages.length > 0
      ? newImages
      : existingEvent.images;

    let parsedPlanning;
    try {
      if (typeof planning === 'string' && planning.trim().startsWith('[')) {
        parsedPlanning = JSON.parse(planning);
      } else {
        parsedPlanning = planning;
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid planning format. Must be a JSON array.' });
    }

    const updated = await service.updateecologiques(eventId, {
      titre_eventEco: titre_eventEco || existingEvent.titre_eventEco,
      description_eventEco: description_eventEco || existingEvent.description_eventEco,
      planning: parsedPlanning || existingEvent.planning,
      date_eventEco: date_eventEco || existingEvent.date_eventEco,
      image_eventEco,
      images,
    });

    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.delete = async (req, res) => {
  try {
    const deleted = await service.deleteecologiques(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'ecologiques not found' });
    res.json({ message: 'ecologiques deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};