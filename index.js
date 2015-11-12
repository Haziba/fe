var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.use(express.static('public'));

var sockets = {};

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
			if(player !== userId && game.players[player].connected){
				console.log("Send to", player, message);
				sockets[player].emit('update', message);
			}
	});
	
	socket.on('process', function(message){
		console.log(message);
		switch(message.event){
			case 'soldier fight start':
				ResolveFight(message.data);
				break;
			case 'game reset start':
				ResetGame();
				break;
			case 'turn end start':
				NextTurn();
				break;
		}
	});
});

var NextTurn = function(){
	for(var unitId in game.units)
		game.units[unitId].waiting = true;
	
	game.currentTeam = 1 - game.currentTeam;
	
	for(var player in game.players){
		if(game.players[player].connected)
			sockets[player].emit('turn end resolve');
	}
}

var ResetGame = function(){
	game = InitGame(game);
	
	for(var player in game.players)
		if(game.players[player].connected)
			sockets[player].emit('process', {event: 'game reset resolve', data: game});
}

var InitGame = function(lastGame){
	return {
		state: 0, //todo: Make game state enum available here
		currentTeam: 0,
		players: {
			'Harry': {
				connected: lastGame ? lastGame.players['Harry'].connected : false,
				team: 0
			},
			'Laurie': {
				connected: lastGame ? lastGame.players['Laurie'].connected : false,
				team: 1
			}
		},
		units: {
			'Holmes': {
				pos: {x: 3, y: 6},
				type: 1, //todo: Make soldier types enum available here
				team: 0,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 4
				}
			},
			'Ace': {
				pos: {x: 3, y: 8},
				type: 0,
				team: 1,
				waiting: false,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 4
				}
			}
		},
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
}

var ResolveFight = function(combatants){	
	var myUnit = game.units[combatants.me.id]
	var enemyUnit = game.units[combatants.enemy.id];
	
	enemyUnit.stats.health = Math.max(enemyUnit.stats.health - myUnit.stats.strength, 0);
	
	if(enemyUnit.stats.health > 0)
		myUnit.stats.health = Math.max(myUnit.stats.health - enemyUnit.stats.strength, 0);
	
	var units = {};
	units[combatants.me.id] = myUnit;
	units[combatants.enemy.id] = enemyUnit;
	
	for(var player in game.players)
		if(game.players[player].connected){
			sockets[player].emit('process', {event: 'soldier fight resolve', data: units});
		}
	
	if(myUnit.stats.health == 0 || enemyUnit.stats.health == 0)
		CheckForGameEnd();
}

var CheckForGameEnd = function(){
	var remainingZero = RemainingLivingUnitsFor(0);
	var remainingOne = RemainingLivingUnitsFor(1);
	
	if(remainingZero == 0 && remainingOne == 0)
		game.state = 3;
	else if(remainingZero == 0)
		game.state = 2;
	else if(remainingOne == 0)
		game.state = 1;
	
	if(game.state != 0)
		for(var player in game.players)
			if(game.players[player].connected)
				sockets[player].emit('update', {event: 'game state change', data: game.state});
}

var RemainingLivingUnitsFor = function(team){
	var remaining = 0;
	
	for(var unitId in game.units)
		if(game.units[unitId].team == team && game.units[unitId].stats.health > 0)
			remaining++;
	
	return remaining;
}

var game = InitGame();