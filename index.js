var bus = require('./server/pubsub.js');

var models = 
{
	Player: require('./server/player.js')
};

var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');
var db = require('./server/db.js')();
//var Game = require('./server/game.js');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.get('/v_next', function(req, res){
	res.sendfile('angular.html');
});

require('./server/api/users/routes.js')(app, express, db, models);

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
//var game = Game(server, debugEnv);

server.listen(app.get('port') ,app.get('ip'), function () {
	console.log('listening on *:' + app.get('port'));
});

