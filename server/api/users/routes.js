var bodyParser = require('body-parser');

module.exports = function(app, express, db, users){
	app.use(bodyParser.urlencoded({ extended: false }));

	var router = express.Router();

	require('./update')(router, db, users);
	require('./register')(router, db, users);
	require('./login')(router, users);
	require('./auth')(router, users);
	
	app.use('/user', router);
}