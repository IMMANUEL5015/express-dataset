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

		const documents = [];

		for (let i = 0; i < docs.length; i++) {
			const doc = docs[i];
			const obj = doc;
			delete obj._id;

			documents.push(obj);
		}

		return res.status(200).json(documents);
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
		const { db } = require('../controllers/actors');

		database.findOne({ id }, function (err, doc) {
			if (err) return res.status(500).json({ status: 'error', message: err.message });

			db.findOne({ id: actor.id }, (error, theActor) => {
				if (error) return res.status(500).json({ status: 'error', message: error.message });

				if (!theActor) {
					const obj = {};

					obj.id = actor.id;
					obj.login = actor.login;
					obj.avatar_url = actor.avatar_url;
					obj.num_of_associated_events = 1;
					obj.timestamp_of_latest_event = new Date(created_at).getTime();

					let maximum_streak = 1;

					database.find({ 'actor.id': Number(actor.id), created_at }, function (err, theDocs) {
						db.findOne({ id: Number(actor.id) }, function (err, theDoc) {
							if (theDocs && theDoc && theDoc.maximum_streak > theDocs.length + 1) {
								maximum_streak = theDoc.maximum_streak;
							} else if (theDocs && theDoc && theDoc.maximum_streak < theDocs.length + 1) {
								maximum_streak = theDocs.length + 1;
							}
							obj.maximum_streak = maximum_streak;
							db.insert(obj);

							if (!doc) {
								database.insert(data);
								return res.status(201).json({});
							} else {
								return errorResponse(res, 400, 'Every event must have a unique id.');
							}
						})
					});
				} else {
					let maximum_streak = 1;

					database.find({ 'actor.id': Number(actor.id), created_at }, function (err, theDocs) {
						db.findOne({ id: Number(actor.id) }, function (err, theDoc) {
							if (theDocs && theDoc && theDoc.maximum_streak > theDocs.length + 1) {
								maximum_streak = theDoc.maximum_streak;
							} else if (theDocs && theDoc && theDoc.maximum_streak < theDocs.length + 1) {
								maximum_streak = theDocs.length + 1;
							}

							db.update(
								{ id: Number(actor.id) },
								{
									$set:
									{
										num_of_associated_events: theActor.num_of_associated_events + 1,
										timestamp_of_latest_event: new Date(created_at).getTime(),
										maximum_streak
									}
								},
								{}
							)

							if (!doc) {
								database.insert(data);
								return res.status(201).json({});
							} else {
								return errorResponse(res, 400, 'Every event must have a unique id.');
							}
						})
					});
				}
			});
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

			const { db } = require('../controllers/actors');
			db.remove({}, { multi: true });

			return res.status(200).json({});
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