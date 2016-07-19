var bus = require('./server/pubsub.js');

var models = require('./server/models.js');
var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');
var exphbr = require('express-handlebars');
var db = require('./server/db.js')(models);
var managers = require('./server/managers.js')(db, bus);
var libraries = require('./server/libraries.js')();
var input = require('./server/input.js')(managers, libraries);
require('./server/passport.js')(express, app, managers.User, models);
require('./server/localLogin.js')(app, managers.User, models, libraries);

require('./server/lobby.js')(bus);
var Game = require('./server/game.js');

var hbs = exphbr.create({
  helpers: {
    toJSON : function(object) {
      return JSON.stringify(object);
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', function(req, res){
	res.render('index', {
		user: req.user,
    items: libraries.Item.all(),
	});
});

app.get('/v_next', function(req, res){
	// No current v_next to send to
});

app.get('/socket.io/:fileName', function(req, res){
	res.sendfile('./node_modules/socket.io/node_modules/socket.io-client/' + req.params.fileName);
});

app.use(express.static('public'));

var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var debugEnv = ip == "127.0.0.1";

if(debugEnv)
	db.initialise('mongodb://localhost:27017/landwars');
else
	db.initialise(process.env.OPENSHIFT_MONGODB_DB_URL);

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000);
app.set('ip', ip);

var server = http.Server(app);

var socket = require('./server/socket.js')(bus, server);
var game = Game(server, debugEnv, managers.User, socket, bus);

require('./server/api/users/routes.js')(app, express, db, managers.User);
require('./server/api/units/routes.js')(app, express, db, managers.User);

server.listen(app.get('port'), app.get('ip'), function () {
  var stdin = process.openStdin();
  stdin.addListener("data", input.process);

	console.log('listening on ' + app.get('ip') + ':' + app.get('port'));
});
