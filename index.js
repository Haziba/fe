var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.use(express.static('public'));

var sockets = {};

var game = {
	players: {
		'Harry': {
			connected: false,
			team: 0
		},
		'Laurie': {
			connected: false,
			team: 1
		}
	},
	units: [
		{
			id: 'Holmes',
			pos: {x: 3, y: 6},
			type: 1, // Make soldier types enum available here
			team: 0,
			stats: {
				health: 18,
				maxHealth: 18,
				strength: 4
			}
		},
		{
			id: 'Ace',
			pos: {x: 3, y: 8},
			type: 0,
			team: 1,
			stats: {
				health: 18,
				maxHealth: 18,
				strength: 4
			}
		}
	],
	map: [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,1,1,1,1,0,1,1,1,1,0,0,1],
		  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
		  [1,0,0,1,1,1,1,0,1,1,1,1,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,1,1,1,1,0,1,1,1,1,0,0,1],
		  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
		  [1,0,0,1,1,1,1,0,1,1,1,1,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]
};

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

var server = http.Server(app);

server.listen(app.get('port') ,app.get('ip'), function () {
	console.log('listening on *:' + app.get('port'));
});

var io = require('socket.io')(server);

io.on('connection', function(socket){
	var userId;
	
	socket.on('disconnect', function(){
		if(!userId)
			return;
	
		console.log("disconnected", userId);
		
		game.players[userId].connected = false;
		delete sockets[userId];
	});
	
	socket.on('init', function(msg){
		userId = msg.id;
		
		console.log("connected", msg.id);
		
		game.players[userId].connected = true;
		sockets[userId] = this;
		
		socket.emit('init', game);
	});
	
	socket.on('update', function(message){
		console.log(message);
		switch(message.event){
			case 'soldier move':
				for(var i = 0; i < game.units.length; i++)
					if(game.units[i].id == message.data.id)
						game.units[i].pos = message.data.pos;
				break;
		}
		
		message.event = 'socket ' + message.event;
		
		for(var player in game.players)
			if(player !== userId && game.players[player].connected)
			{
				console.log("Send to", player, message);
				sockets[player].emit('update', message);
			}
	});
});