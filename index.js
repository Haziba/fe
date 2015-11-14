var app = require('express')();
var http = require('http');
var path = require('path');
var express = require('express');
var enums = require('./public/js/enums.js');

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
				sockets[player].emit('update', {event: 'enemy connection', data: false});
	});
	
	socket.on('init', function(msg){
		userId = msg.id;
		
		console.log("connected", msg.id);
		
		game.players[userId].connected = true;
		sockets[userId] = this;
		
		socket.emit('init', game);
		
		for(var player in game.players)
			if(player != userId && game.players[player].connected)
				sockets[player].emit('update', {event: 'enemy connection', data: true});
	});
	
	socket.on('process', function(message){
		console.log(message);
		switch(message.event){
			case 'soldier move start':
				ResolveMove(message.data);
				break;
			case 'soldier fight start':
				ResolveFight(message.data);
				break;
			case 'game reset start':
				ResetGame();
				break;
			case 'turn end start':
				NextTurn();
				break;
			case 'soldier done start':
				SoldierDone(message.data);
				break;
		}
	});
});

var NextTurn = function(){
	for(var unitId in game.units){
		game.units[unitId].waiting = true;
		game.units[unitId].stats.moves.remaining = game.units[unitId].stats.moves.max;
		game.units[unitId].stats.fights.remaining = game.units[unitId].stats.fights.max;
	}
	
	game.activeTeam = 1 - game.activeTeam;
	
	for(var player in game.players){
		if(game.players[player].connected)
			sockets[player].emit('process', {event: 'turn end resolve', data: game.activeTeam});
	}
}

var SoldierDone = function(unit){
	game.units[unit.id].waiting = false;
	
	for(var player in game.players)
		if(game.players[player].connected)
			sockets[player].emit('process', {event: 'soldier done resolve', data: unit.id});
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
			'HarrySoldierOne': {
				pos: {x: 2, y: 2},
				type: enums.Soldier.AXE,
				team: 0,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'HarrySoldierTwo': {
				pos: {x: 2, y: 4},
				type: enums.Soldier.ARCHER,
				team: 0,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'HarryCaptain': {
				pos: {x: 2, y: 7},
				type: enums.Soldier.SWORD,
				team: 0,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'HarrySoldierThree': {
				pos: {x: 2, y: 10},
				type: enums.Soldier.ARCHER,
				team: 0,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'HarrySoldierFour': {
				pos: {x: 2, y: 12},
				type: enums.Soldier.AXE,
				team: 0,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'LaurieSoldierOne': {
				pos: {x: 17, y: 2},
				type: enums.Soldier.AXE,
				team: 1,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'LaurieSoldierTwo': {
				pos: {x: 17, y: 4},
				type: enums.Soldier.ARCHER,
				team: 1,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'LaurieCaptain': {
				pos: {x: 17, y: 7},
				type: enums.Soldier.SWORD,
				team: 1,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'LaurieSoldierThree': {
				pos: {x: 17, y: 10},
				type: enums.Soldier.ARCHER,
				team: 1,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
			'LaurieSoldierFour': {
				pos: {x: 17, y: 12},
				type: enums.Soldier.AXE,
				team: 1,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			},
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

var ResolveMove = function(data){
	game.units[data.unitId].pos = data.pos;
	
	game.units[data.unitId].stats.moves.remaining -= data.steps;
	
	for(var player in game.players)
		if(game.players[player].connected)
			sockets[player].emit('process', {event: 'soldier move resolve', data: {unitId: data.unitId, pos: data.pos}});
}

var ResolveFight = function(combatants){	
	var myUnit = game.units[combatants.me.id]
	var enemyUnit = game.units[combatants.enemy.id];
	
	enemyUnit.stats.health = Math.max(enemyUnit.stats.health - Math.max(myUnit.stats.strength - enemyUnit.stats.armour, 0), 0);
	
	//todo: De-meh this. Would help having the TileHelper in to be all "Are these tiles in a range of 1???"
	if(enemyUnit.type != 2 && ((enemyUnit.pos.x == myUnit.pos.x && Math.abs(enemyUnit.pos.y - myUnit.pos.y) == 1) || (Math.abs(enemyUnit.pos.x - myUnit.pos.x) == 1 && enemyUnit.pos.y == myUnit.pos.y)))
		if(enemyUnit.stats.health > 0)
			myUnit.stats.health = Math.max(myUnit.stats.health - Math.max(enemyUnit.stats.strength - myUnit.stats.amour, 0), 0);
	
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