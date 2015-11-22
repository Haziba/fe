var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');
var enums = require('./public/js/enums.js');
var unitFactory = require('./server/unitFactory.js')(enums);
var worlds = require('./server/worlds.js')();

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
		
		for(var player in game.players)
			if(game.players[player].connected)
				sockets[player].emit('process', {event: 'enemy connection resolve', data: false});
	});
	
	socket.on('init', function(msg){
		userId = msg.id;
		
		console.log("connected", msg.id);
		
		game.players[userId].connected = true;
		sockets[userId] = this;
		
		socket.emit('init', game);
		
		for(var player in game.players)
			if(player != userId && game.players[player].connected)
				sockets[player].emit('process', {event: 'enemy connection resolve', data: true});
	});
	
	socket.on('action', function(action){
		console.log("----" + userId + "----");
		var response = ProcessAction(action);
		console.log("----RESPONSE----");
		console.log(response);
		
		CheckForGameEnd();
		
		for(var player in game.players){
			if(game.players[player].connected){
				sockets[player].emit('action', {action: action.action, data: response});
				
				if(game.state != 0){
					sockets[player].emit('action', {action: 'state change', data: game.state});
				}
			}
		}
	});
	
	//todo: Move the rest of these to the action queue
	socket.on('process', function(message){
		console.log(message);
		switch(message.event){
			case 'soldier done start':
				SoldierDone(message.data);
				break;
		}
	});
});

var ProcessAction = function(action){
	console.log(action);
	
	switch(action.action){
		case 'soldier move':
			return MoveSoldier(action.data);
		case 'soldier fight':
			return ResolveFight(action.data);
		case 'turn end':
			return TurnEnd(action.data);
		case 'game reset':
			return GameReset();
	}
}

var GameReset = function(){
	game = InitGame(game);
	
	return game;
}

var MoveSoldier = function(data){
	var myUnit = game.units[data.unitId];
	
	myUnit.pos = data.move.pos;
	myUnit.stats.moves.remaining -= data.move.steps;
	
	return data;
}

var ResolveFight = function(fight){
	var myUnit = game.units[fight.unitId];
	var enemyUnit = game.units[fight.enemyUnitId];
	
	enemyUnit.stats.health = Math.max(enemyUnit.stats.health - Math.max(myUnit.stats.strength - enemyUnit.stats.armour, 0), 0);
	
	//todo: De-meh this. Would help having the TileHelper in to be all "Are these tiles in a range of 1???"
	if(enemyUnit.combatRetaliation && InMeleeRange(myUnit, enemyUnit))
		if(enemyUnit.stats.health > 0)
			myUnit.stats.health = Math.max(myUnit.stats.health - Math.max(enemyUnit.stats.strength - myUnit.stats.armour, 0), 0);
	
	fight.health = myUnit.stats.health;
	fight.enemyHealth = enemyUnit.stats.health;
	
	myUnit.stats.fights.remaining--;
	
	return fight;
}

var TurnEnd = function(){
	for(var unitId in game.units){
		game.units[unitId].waiting = true;
		game.units[unitId].stats.moves.remaining = game.units[unitId].stats.moves.max;
		game.units[unitId].stats.fights.remaining = game.units[unitId].stats.fights.max;
	}
	
	game.activeTeam = 1 - game.activeTeam;
	
	return game.activeTeam;
}

var SoldierDone = function(unit){
	game.units[unit.id].waiting = false;
	
	for(var player in game.players)
		if(game.players[player].connected)
			sockets[player].emit('process', {event: 'soldier done resolve', data: unit.id});
}

var InitGame = function(lastGame){
	return {
		state: 0, //todo: Make game state enum available here
		activeTeam: 0,
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
			'HarrySoldierOne': unitFactory.NewAxe(0, {x: 2, y: 2}),
			'DebugSoldier': unitFactory.NewAxe(1, {x: 1, y: 6}),
			//'HarrySoldierTwo': unitFactory.NewArcher(0, {x: 1, y: 3}),
			//'HarryCaptain': unitFactory.NewSword(0, {x: 2, y: 4}),
			//'HarrySoldierThree': unitFactory.NewArcher(0, {x: 1, y: 5}),
			//'HarrySoldierFour': unitFactory.NewSword(0, {x: 2, y: 6}),
			//'HarrySoldierFive': unitFactory.NewArcher(0, {x: 1, y: 7}),
			//'HarrySoldierSix': unitFactory.NewSpear(0, {x: 2, y: 8}),
			
			//'LaurieSoldierOne': unitFactory.NewSpear(1, {x: 12, y: 2}),
			//'LaurieSoldierTwo': unitFactory.NewArcher(1, {x: 13, y: 3}),
			//'LaurieCaptain': unitFactory.NewSword(1, {x: 12, y: 4}),
			//'LaurieSoldierThree': unitFactory.NewArcher(1, {x: 13, y: 5}),
			//'LaurieSoldierFour': unitFactory.NewSword(1, {x: 12, y: 6}),
			//'LaurieSoldierFive': unitFactory.NewArcher(1, {x: 13, y: 7}),
			//'LaurieSoldierSix': unitFactory.NewAxe(1, {x: 12, y: 8}),
		},
		ships: [
			{
				team: 0,
				pos: {
					x: 0,
					y: 5
				}
			},
			{
				team: 1,
				pos: {
					x: 14,
					y: 5
				}
			}
		],
		map: worlds.GetFor(15, 12)
	};
}

var InMeleeRange = function(myUnit, enemyUnit){
	return (enemyUnit.pos.x == myUnit.pos.x && Math.abs(enemyUnit.pos.y - myUnit.pos.y) == 1) || (Math.abs(enemyUnit.pos.x - myUnit.pos.x) == 1 && enemyUnit.pos.y == myUnit.pos.y);
}

var CheckForGameEnd = function(){
	for(var i = 0; i < game.ships.length; i++){
		var ship = game.ships[i];
		
		for(var unitId in game.units){
			var unit = game.units[unitId];
			
			if(ship.pos.x == unit.pos.x && ship.pos.y == unit.pos.y && ship.team != unit.team){
				game.state = 1 + unit.team;
			}
		}
	}
}

var RemainingLivingUnitsFor = function(team){
	var remaining = 0;
	
	for(var unitId in game.units)
		if(game.units[unitId].team == team && game.units[unitId].stats.health > 0)
			remaining++;
	
	return remaining;
}

var game = InitGame();