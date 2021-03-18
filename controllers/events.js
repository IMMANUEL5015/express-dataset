const Datastore = require('nedb');
const database = new Datastore('database.db');
database.loadDatabase();

const errorResponse = (res, statusCode, message) => {
	return res.status(statusCode).json({
		status: 'error',
		message
	});
}

var getAllEvents = async (req, res, next) => {
	try {
		database.find({}).sort({ id: 1 }).exec(function (err, docs) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			return res.status(200).json({
				status: 'success',
				events: docs
			});
		})
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
				return res.status(201).json({
					status: 'success',
					message: 'created'
				});
			}

			return errorResponse(res, 400, 'Every event must have a unique id.');
		});


	} catch (error) {
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
};


var getByActor = () => {

};


var eraseEvents = async (req, res, next) => {
	try {
		database.remove({}, { multi: true }, function (err, numRemoved) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			return res.status(200).json({
				status: 'success'
			});
		});
	} catch (error) {
		console.error(error);
		console.error(error);
		return res.status(500).json({ status: 'error', message: error.message });
	}
};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents
};

















