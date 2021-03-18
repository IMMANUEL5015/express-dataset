var { database } = require('../controllers/events');
const DB = require('nedb');
const db = new DB('actors.db');
db.loadDatabase();

const sortEvents = (query, res) => {
	return query.sort({ num_of_associated_events: -1, timestamp_of_latest_event: -1, login: 1 })
		.exec(function (err, docs) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			let actors = [];

			for (let i = 0; i < docs.length; i++) {
				const doc = docs[i];
				const obj = {};

				obj.id = doc.id;
				obj.login = doc.login;
				obj.avatar_url = doc.avatar_url;

				actors.push(obj);
			}

			return res.status(200).json(actors);
		})
}

const errorResponse = (res, statusCode, message) => {
	return res.status(statusCode).json({
		status: 'error',
		message
	});
}

var getAllActors = async (req, res, next) => {
	try {
		return sortEvents(db.find({}), res);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
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

			db.update(
				{ id: Number(id) },
				{ $set: { avatar_url } },
				{}
			);

			database.update(
				{ 'actor.id': Number(id) },
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
	getStreak: getStreak,
	db
};

















