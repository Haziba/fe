var bodyParser = require('body-parser');

module.exports = function(app, express, db, users){
	app.use(bodyParser.urlencoded({ extended: false }));

	var router = express.Router();

	require('./setItem')(router, db, users);

	app.use('/unit', router);
}
