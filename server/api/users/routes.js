var bodyParser = require('body-parser');

module.exports = function(app, express, db, socket){
	app.use(bodyParser.urlencoded({ extended: false }));

	var router = express.Router();

	require('./update')(router, db);
	require('./register')(router, db);
	require('./login')(router, db);
	require('./auth')(router, db, socket);
	
	app.use('/user', router);
}