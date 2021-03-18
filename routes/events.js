var express = require('express');
var router = express.Router();
var { addEvent, getAllEvents, getByActor } = require('../controllers/events');

// Routes related to event
router.get('/', getAllEvents);
router.post('/', addEvent);
router.get('/actors/:actorID', getByActor)

module.exports = router;