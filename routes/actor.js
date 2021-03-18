var express = require('express');
var router = express.Router();
var { updateActor, getAllActors } = require('../controllers/actors');

// Routes related to actor.
router.get('/', getAllActors);
router.put('/', updateActor);

module.exports = router;