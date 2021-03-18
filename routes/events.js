var express = require('express');
var router = express.Router();
var { addEvent, getAllEvents } = require('../controllers/events');

// Routes related to event
router.get('/', getAllEvents);
router.post('/', addEvent);

module.exports = router;