const Datastore = require('nedb');
const database = new Datastore('database.db');
database.loadDatabase();

const errorResponse = (res, statusCode, message) => {
	return res.status(statusCode).json({
		status: 'error',
		message
	});
}

const sortEvents = (query, res) => {
	return query.sort({ id: 1 }).exec(function (err, docs) {
		if (err) return res.status(500).json({ status: 'error', message: err.message });

		return res.status(200).json(docs);
	})
}

var getAllEvents = async (req, res, next) => {
	try {
		return sortEvents(database.find({}), res);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
};

var addEvent = async (req, res, next) => {
	try {
		const { id, type, actor, repo, created_at } = req.body;
		const data = { id, type, actor, repo, created_at };

		database.findOne({ id }, function (err, doc) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			if (!doc) {
				database.insert(data);
				return res.status(201).send();
			}

			return errorResponse(res, 400, 'Every event must have a unique id.');
		});


	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
};


var getByActor = async (req, res, next) => {
	try {
		const actorId = req.params.actorID;

		database.findOne({ 'actor.id': Number(actorId) }, function (err, doc) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			if (!doc) {
				return errorResponse(res, 404, 'The actor does not exist.');
			}

			return sortEvents(database.find({ 'actor.id': Number(actorId) }), res);
		});

	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
};


var eraseEvents = async (req, res, next) => {
	try {
		database.remove({}, { multi: true }, function (err, numRemoved) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			return res.status(200).send();
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents,
	database: database
};

















