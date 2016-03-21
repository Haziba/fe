var bodyParser = require('body-parser');

module.exports = function(app, express, db){
	app.use(bodyParser.urlencoded({ extended: false }));

	var router = express.Router();

	require('./update')(router, db);
	require('./register')(router, db);
	require('./login')(router, db);
	
	app.use('/user', router);
}