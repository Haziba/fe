var bodyParser = require('body-parser');

module.exports = function(app, express, db, models){
	app.use(bodyParser.urlencoded({ extended: false }));

	var router = express.Router();

	require('./update')(router, db, models);
	require('./register')(router, db, models);
	require('./login')(router, db, models);
	
	app.use('/user', router);
}