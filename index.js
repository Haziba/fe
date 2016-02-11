var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');
var db = require('./server/db.js')();
var Game = require('./server/game.js');
var bodyParser = require('body-parser');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.use(bodyParser.urlencoded({ extended: false }));

var router = express.Router();

router.route('/:user_id').get(function(req, res){
	var userId = req.params.user_id;
	var userData = {exists: false};
	
	db.getPlayer(userId).then(function(player){
		if(player != null)
			userData.exists = true;
		
		userData.player = player;
		
		res.json(userData);
	}, function(error){
		console.log("Error! `" + error + "`");
	});
}).post(function(req, res){
	var player = req.body;
	player.id = req.params.user_id;
	
	db.setPlayer(player).then(function(){
		res.json({"success": true});
	}, function(err){
		res.json({"success": false, "error": err});
	});
});

app.use('/user', router);

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
var game = Game(server, debugEnv);

server.listen(app.get('port') ,app.get('ip'), function () {
	console.log('listening on *:' + app.get('port'));
});

