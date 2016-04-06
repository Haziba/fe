var bus = require('./server/pubsub.js');

var models = 
{
	User: require('./server/user.js')
};

var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');
var db = require('./server/db.js')(models);
var users = require('./server/users.js')(db, bus);

require('./server/lobby.js')(bus);
var Game = require('./server/game.js');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.get('/v_next', function(req, res){
	// No current v_next to send to
});

app.post('/fblogin', function(req, res){
	// what are the post varbs?
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(req.body));
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
var game = Game(server, debugEnv, users, socket, bus);

require('./server/api/users/routes.js')(app, express, db, users);

server.listen(app.get('port'), app.get('ip'), function () {
	console.log('listening on *:' + app.get('port'));
});

