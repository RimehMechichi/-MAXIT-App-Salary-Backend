  const service = require('../viewModels/eventCalendarServices.js');
  
  exports.create = async (req, res) => {
  try {
    const eventCalendar = await service.createEventcalendar(req.body);
    res.status(201).json(eventCalendar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  };
  
  exports.getAll = async (req, res) => {
    try {
      const eventcalendars = await service.getAllEventcalendars();
      res.json(eventcalendars);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.getById = async (req, res) => {
    try {
      const eventcalendar = await service.getEventcalendarById(req.params.id);
      if (!eventcalendar) return res.status(404).json({ message: 'eventcalendar not found' });
      res.json(eventcalendar);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.update = async (req, res) => {
    try {
      const updated = await service.updateEventcalendar(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: 'eventcalendar not found' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.delete = async (req, res) => {
    try {
      const deleted = await service.deleteEventcalendar(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'eventcalendar not found' });
      res.json({ message: 'eventcalendar deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  