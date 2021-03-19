var express = require('express');
var router = express.Router();
var { updateActor, getAllActors, getStreak } = require('../controllers/actors');

// Routes related to actor.
router.get('/', getAllActors);
router.get('/streak', getStreak);
router.put('/', updateActor);

module.exports = router;