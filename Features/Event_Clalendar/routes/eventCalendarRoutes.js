const express = require('express');
const router = express.Router();
const eventcalendarController = require('../views/eventCalendarControllers.js');

router.post('/eventcalendar', eventcalendarController.create);
router.get('/eventcalendar', eventcalendarController.getAll);
router.get('/eventcalendar/:id', eventcalendarController.getById);
router.put('/eventcalendar/:id', eventcalendarController.update);
router.delete('/eventcalendar/:id', eventcalendarController.delete);

module.exports = router;
