var express = require('express');
var router = express.Router();
var { updateActor } = require('../controllers/actors');

// Routes related to actor.
router.put('/', updateActor);

module.exports = router;