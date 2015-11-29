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

app.get('/newGame', function(req, res){
	var queryString = req.url.substr(req.url.indexOf('?')+1);
	
	var splitString = queryString.split('&');
	
	var qsVal = {};
	
	for(var i = 0; i < splitString.length; i++){
		var val = splitString[i].split('=');
		qsVal[val[0]] = val[1];
	}
	
	if(!qsVal.id1 || !qsVal.id2){
		res.sendStatus(400);
		return;
	}
	
	if(inGamePlayers[qsVal.id1] || inGamePlayers[qsVal.id2]){
		res.sendStatus(400);
		return;
	}
	
	StartNewGame(qsVal.id1, qsVal.id2);
	
	res.sendStatus(200);
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
	var game;
	
	socket.on('disconnect', function(){
		if(!userId)
			return;
	
		console.log("disconnected", userId);
		
		game.data.players[userId].connected = false;
		delete sockets[userId];
		
		for(var player in game.data.players)
			if(game.data.players[player].connected)
				sockets[player].emit('process', {event: 'enemy connection resolve', data: false});
	});
	
	socket.on('init', function(msg){
		userId = msg.id;
		
		console.log("connected", msg.id);
		
		game = inGamePlayers[userId];
		console.log(game);
		
		game.data.players[userId].connected = true;
		sockets[userId] = this;
		
		socket.emit('init', {serverTime: (new Date()).getTime(), game: game.data});
		
		for(var player in game.data.players)
			if(player != userId && game.data.players[player].connected)
				sockets[player].emit('process', {event: 'enemy connection resolve', data: true});
	});
	
	socket.on('action', function(action){
		console.log("----" + userId + "----");
		var response = ProcessAction(game, action);
		console.log("----RESPONSE----");
		console.log(response);
		
		CheckForGameEnd(game);
		
		var autoTurnEnd = AutoTurnEnd(game);
		
		if(autoTurnEnd){
			TurnEnd(game);
		}
		
		for(var player in game.data.players){
			if(game.data.players[player].connected){
				sockets[player].emit('action', {action: action.action, data: response});
				
				if(game.data.state != 0){
					sockets[player].emit('action', {action: 'state change', data: game.data.state});
				}else if(autoTurnEnd){
					sockets[player].emit('action', {action: 'turn end', data: game.data.activeTeam});
				}
			}
		}
	});
});

var ProcessAction = function(game, action){
	console.log(action);
	
	switch(action.action){
		case 'soldier move':
			return MoveSoldier(game, action.data);
		case 'soldier fight':
			return ResolveFight(game, action.data);
		case 'soldier done':
			return SoldierDone(game, action.data);
		case 'turn end':
			return TurnEnd(game);
		case 'game reset':
			return GameReset(game);
	}
}

var GameReset = function(game) {
	var players = Object.keys(game.data.players);
	
	game.data = InitGame(players[0], players[1], game.data);
	
	return game.data;
}

var MoveSoldier = function(game, data){
	var myUnit = game.data.units[data.unitId];
	
	myUnit.pos = data.move.pos;
	myUnit.stats.moves.remaining -= data.move.steps;
	
	if(myUnit.stats.moves.remaining == 1 && (myUnit.stats.fights.remaining == 0 || !data.move.fightable))
		myUnit.waiting = false;
	
	return data;
}

var ResolveFight = function(game, fight){
	var myUnit = game.data.units[fight.unitId];
	var enemyUnit = game.data.units[fight.enemyUnitId];
	
	enemyUnit.stats.health = Math.max(enemyUnit.stats.health - Math.max(myUnit.stats.strength - enemyUnit.stats.armour, 0), 0);
	
	//todo: De-meh this. Would help having the TileHelper in to be all "Are these tiles in a range of 1???"
	if(enemyUnit.combatRetaliation && InMeleeRange(myUnit, enemyUnit))
		if(enemyUnit.stats.health > 0)
			myUnit.stats.health = Math.max(myUnit.stats.health - Math.max(enemyUnit.stats.strength - myUnit.stats.armour, 0), 0);
	
	fight.health = myUnit.stats.health;
	fight.enemyHealth = enemyUnit.stats.health;
	
	myUnit.stats.fights.remaining--;
	
	if(myUnit.stats.fights.remaining == 0 && myUnit.stats.moves.remaining == 1)
		myUnit.waiting = false;
	
	return fight;
}

var SoldierDone = function(game, unitId){
	var myUnit = game.data.units[unitId];
	
	myUnit.stats.moves.remaining = 0;
	myUnit.stats.fights.remaining = 0;
	myUnit.waiting = false;
	
	return unitId;
}

var TurnEnd = function(game){
	for(var unitId in game.data.units){
		game.data.units[unitId].waiting = true;
		game.data.units[unitId].stats.moves.remaining = game.data.units[unitId].stats.moves.max;
		game.data.units[unitId].stats.fights.remaining = game.data.units[unitId].stats.fights.max;
	}
	
	game.data.activeTeam = 1 - game.data.activeTeam;
	
	clearTimeout(game.turnTimer);
	game.turnTimer = setTimeout(function(){ TimeRunOut(game); }, game.data.turnTime * 1000);
	game.data.lastTurnStart = (new Date()).getTime();
	
	return game.data.activeTeam;
}

var TimeRunOut = function(game){
	var response = TurnEnd();
	
	for(var player in game.data.players){
		if(game.data.players[player].connected){
			sockets[player].emit('action', {action: 'turn end', data: response});
		}
	}
}

var InMeleeRange = function(myUnit, enemyUnit){
	return (enemyUnit.pos.x == myUnit.pos.x && Math.abs(enemyUnit.pos.y - myUnit.pos.y) == 1) || (Math.abs(enemyUnit.pos.x - myUnit.pos.x) == 1 && enemyUnit.pos.y == myUnit.pos.y);
}

var CheckForGameEnd = function(game){
	for(var i = 0; i < game.data.ships.length; i++){
		var ship = game.data.ships[i];
		
		for(var unitId in game.data.units){
			var unit = game.data.units[unitId];
			
			if(ship.pos.x == unit.pos.x && ship.pos.y == unit.pos.y && ship.team != unit.team){
				game.data.state = 1 + unit.team;
			}
		}
	}
}

var AutoTurnEnd = function(game){
	for(var unitId in game.data.units){
		if(game.data.units[unitId].stats.health > 0 && game.data.units[unitId].team == game.data.activeTeam && game.data.units[unitId].waiting)
			return false;
	}
	
	return true;
}

var RemainingLivingUnitsFor = function(game, team){
	var remaining = 0;
	
	for(var unitId in game.data.units)
		if(game.data.units[unitId].team == team && game.data.units[unitId].stats.health > 0)
			remaining++;
	
	return remaining;
}

var InitGame = function(id1, id2, lastGame){
	var turnTime = 30;
	
	var game = {
		turnTimer: setTimeout(function(){ TimeRunOut(game); }, turnTime * 1000),
		data: {
			turnTime: turnTime,
			lastTurnStart: (new Date()).getTime(),
			state: 0, //todo: Make game state enum available here
			activeTeam: 0,
			players: {
			},
			units: {
				'HarrySoldierOne': unitFactory.NewAxe(0, {x: 2, y: 2}),
				'HarrySoldierTwo': unitFactory.NewArcher(0, {x: 1, y: 3}),
				'HarryCaptain': unitFactory.NewSword(0, {x: 2, y: 4}),
				'HarrySoldierThree': unitFactory.NewArcher(0, {x: 1, y: 5}),
				'HarrySoldierFour': unitFactory.NewSword(0, {x: 2, y: 6}),
				'HarrySoldierFive': unitFactory.NewArcher(0, {x: 1, y: 7}),
				'HarrySoldierSix': unitFactory.NewSpear(0, {x: 2, y: 8}),
				
				'LaurieSoldierOne': unitFactory.NewSpear(1, {x: 4, y: 2}),
				'LaurieSoldierTwo': unitFactory.NewArcher(1, {x: 3, y: 3}),
				'LaurieCaptain': unitFactory.NewSword(1, {x: 4, y: 4}),
				'LaurieSoldierThree': unitFactory.NewArcher(1, {x: 3, y: 5}),
				'LaurieSoldierFour': unitFactory.NewSword(1, {x: 4, y: 6}),
				'LaurieSoldierFive': unitFactory.NewArcher(1, {x: 3, y: 7}),
				'LaurieSoldierSix': unitFactory.NewAxe(1, {x: 4, y: 8}),
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
		}
	};

	game.data.players[id1] = {
		connected: lastGame ? lastGame.players[id1].connected : false,
		team: 0
	};
	
	game.data.players[id2] = {
		connected: lastGame ? lastGame.players[id2].connected : false,
		team: 1
	};
	
	return game;
}

var inGamePlayers = {};
var games = [];

var StartNewGame = function(id1, id2){
	var game = InitGame(id1, id2);
	
	games.push(game);
	
	inGamePlayers[id1] = game;
	inGamePlayers[id2] = game;
}