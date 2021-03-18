var { database } = require('../controllers/events');

const errorResponse = (res, statusCode, message) => {
	return res.status(statusCode).json({
		status: 'error',
		message
	});
}

var getAllActors = () => {

};

var updateActor = async (req, res, next) => {
	try {
		const { id, login, avatar_url } = req.body;

		database.findOne({ 'actor.id': Number(id) }, function (err, doc) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			if (!doc) {
				return errorResponse(res, 404, 'The actor does not exist.');
			}

			if (login) {
				if (login !== doc.actor.login) {
					return errorResponse(res, 400, 'You cannot modify the login details.');
				}
			}

			database.update(
				{ 'actor.avatar_url': doc.actor.avatar_url },
				{ $set: { 'actor.avatar_url': avatar_url } },
				{ multi: true },
				function (err, numReplaced) {
					if (err) return res.status(500).json({ status: 'error', message: err.message });
					return res.status(200).send();
				});
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
};

var getStreak = () => {

};


module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak
};

















