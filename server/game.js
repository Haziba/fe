var enums = require('../public/js/game/enums.js');
var unitFactory = require('./unitFactory.js')(enums);
var worlds = require('./worlds.js')();

module.exports = function(server, debugEnv, users, socket, bus){
	var currentGameId = 0;
	
	bus.sub('game start', function(gameStart){
		var game = {id: currentGameId++};
		var sockets = [];
		var getUsers = [];
		
		for(var i = 0; i < gameStart.users.length; i++){
			sockets.push(gameStart.users[i].socketId);
			
			getUsers.push(users.getById(gameStart.users[i].id));
		}
		
		Promise.all(getUsers).then(function(users){
			console.log("Got gameId", game.id);
			
			game = InitGame(game.id, users[0], users[1]);
		
			// Set up socket connect / disconnect
			for(var i = 0; i < gameStart.users.length; i++){
				InitialiseUser(sockets, game, gameStart.users[i]);
			}
			
			bus.sub('game ' + game.id + ' action', function(msg){
					console.log("----" + msg.user.name + "----");
					var response = ProcessAction(game, msg);
					console.log("----RESPONSE----");
					console.log(response);
					
					CheckForGameEnd(game);
					
					var autoTurnEnd = AutoTurnEnd(game);
					
					if(autoTurnEnd)
						TurnEnd(game);
					
					bus.pub('socket message', sockets, 'game', {
						type: 'action',
						data: {
							action: msg.type,
							response: response
						}
					});
					
					if(game.data.state != 0){
						bus.pub('socket message', sockets, 'game', {
							type: 'action',
							data: {
								action: 'state change',
								response: game.data.state
							}
						});
					}else if(autoTurnEnd){
						bus.pub('socket message', sockets, 'game', {
							type: 'action',
							data: {
								action: 'turn end',
								response: game.data.activeUser
							}
						});
					}
			}, 'game ' + game.id);
			
			bus.pub('socket message', sockets, 'game', {
				type: 'gameStarted',
				data: game.data
			});
			
			console.log('users', game.data.users);
		});
		
		return;
	});
	
	var InitialiseUser = function(gameSockets, game, user){
		bus.sub('user connect ' + user.id, function(user){
			game.data.users[user.id].connected = true;
			
			var sockets = Object.keys(game.data.users).map(function(userId){ return game.data.users[userId].socketId; });
			
			bus.pub('socket message', sockets, 'game', {
				type: 'connection change', 
				data: {
					userId: user.id, 
					connected: true 
				}
			});
			
			game.data.users[user.id].socketId = user.socketId;
			
			bus.pub('socket message ' + game.data.users[user.id].socketId, 'game', {
				type: 'gameStarted',
				data: game.data
			});
			
			console.log('connect', gameSockets);
			gameSockets.push(user.socketId);
			console.log('connect', gameSockets);
		}, 'game ' + game.id);
	
		bus.sub('user disconnect ' + user.id, function(){
			game.data.users[user.id].connected = false;
			
			var sockets = Object.keys(game.data.users).map(function(userId){ return game.data.users[userId].socketId; });
			
			bus.pub('socket message', sockets, 'game', {
				type: 'connection change', 
				data: {
					userId: user.id, 
					connected: false 
				}
			});
			
			console.log('disconnect', gameSockets);
			gameSockets.splice(gameSockets.indexOf(game.data.users[user.id].socketId), 1);
			console.log('disconnect', gameSockets);
		}, 'game ' + game.id);
	}
	
	/* Not been ran through */
	var ProcessAction = function(game, action){
		console.log(action);
		
		switch(action.type){
			case 'soldier move':
				return MoveSoldier(game, action.data);
			case 'soldier fight':
				return ResolveFight(game, action.data);
			case 'soldier done':
				return SoldierDone(game, action.data);
			case 'turn end':
				return TurnEnd(game);
			case 'game reset':
				//return GameReset(game);
				console.log('Game reset needs re-implementing');
				return;
		}
	}

	/* Needs sorting
	var GameReset = function(game) {
		var users = Object.keys(game.data.users);
		
		game.data = InitGame(users[0], users[1], game.data);
		
		return game.data;
	} */

	/* Not been ran through */
	var MoveSoldier = function(game, data){
		var myUnit = game.data.units[data.unitId];
		
		myUnit.pos = data.move.pos;
		myUnit.stats.moves.remaining -= data.move.steps;
		
		if(myUnit.stats.moves.remaining == 1 && (myUnit.stats.fights.remaining == 0 || !data.move.fightable))
			myUnit.waiting = false;
		
		return data;
	}

	/* Not been ran through */
	var ResolveFight = function(game, fight){
		var myUnit = game.data.units[fight.unitId];
		var enemyUnit = game.data.units[fight.enemyUnitId];
		
		enemyUnit.stats.health = Math.max(enemyUnit.stats.health - Math.max(myUnit.stats.strength - enemyUnit.stats.armour, 0), 0);
		
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

	/* Not been ran through */
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
		
		var nextUser = game.data.userOrder.indexOf(game.data.activeUser) + 1;
		
		game.data.activeUser = nextUser >= game.data.userOrder.length ? game.data.userOrder[0] : game.data.userOrder[nextUser];
		
		clearTimeout(game.turnTimer);
		game.turnTimer = setTimeout(function(){ TimeRunOut(game); }, game.data.turnTime * 1000);
		game.data.lastTurnStart = (new Date()).getTime();
		
		return { activeUser: game.data.activeUser };
	}

	var TimeRunOut = function(game){
		var response = TurnEnd(game);
		
		var sockets = Object.keys(game.data.users).map(function(userId){ return game.data.users[userId].socketId; });
		
		bus.pub('socket message', sockets, 'game', {
			type: 'action',
			data: {
				action: 'turn end',
				response: response
			}
		});
	}

	/* Not been ran through */
	var InMeleeRange = function(myUnit, enemyUnit){
		return (enemyUnit.pos.x == myUnit.pos.x && Math.abs(enemyUnit.pos.y - myUnit.pos.y) == 1) || (Math.abs(enemyUnit.pos.x - myUnit.pos.x) == 1 && enemyUnit.pos.y == myUnit.pos.y);
	}

	/* Not been ran through */
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

	/* Not been ran through */
	var AutoTurnEnd = function(game){
		for(var unitId in game.data.units){
			if(game.data.units[unitId].stats.health > 0 && game.data.units[unitId].team == game.data.activeUser && game.data.units[unitId].waiting)
				return false;
		}
		
		return true;
	}

	/* Not been ran through */
	var RemainingLivingUnitsFor = function(game, team){
		var remaining = 0;
		
		for(var unitId in game.data.units)
			if(game.data.units[unitId].team == team && game.data.units[unitId].stats.health > 0)
				remaining++;
		
		return remaining;
	}

	var InitGame = function(gameId, user1, user2){
		var turnTime = 60;
		
		var units = {
			'HarrySoldierOne': unitFactory.NewAxe(user1.id, {x: 2, y: 2}),
			'HarrySoldierTwo': unitFactory.NewArcher(user1.id, {x: 1, y: 3}),
			'HarryCaptain': unitFactory.NewSword(user1.id, {x: 2, y: 4}),
			'HarrySoldierThree': unitFactory.NewArcher(user1.id, {x: 1, y: 5}),
			'HarrySoldierFour': unitFactory.NewSword(user1.id, {x: 2, y: 6}),
			'HarrySoldierFive': unitFactory.NewArcher(user1.id, {x: 1, y: 7}),
			'HarrySoldierSix': unitFactory.NewSpear(user1.id, {x: 2, y: 8}),
			
			'LaurieSoldierOne': unitFactory.NewSpear(user2.id, {x: 12, y: 2}),
			'LaurieSoldierTwo': unitFactory.NewArcher(user2.id, {x: 13, y: 3}),
			'LaurieCaptain': unitFactory.NewSword(user2.id, {x: 12, y: 4}),
			'LaurieSoldierThree': unitFactory.NewArcher(user2.id, {x: 13, y: 5}),
			'LaurieSoldierFour': unitFactory.NewSword(user2.id, {x: 12, y: 6}),
			'LaurieSoldierFive': unitFactory.NewArcher(user2.id, {x: 13, y: 7}),
			'LaurieSoldierSix': unitFactory.NewAxe(user2.id, {x: 12, y: 8}),
		};
		
		if(debugEnv){
			units = {
				'HarrySoldierOne': unitFactory.NewAxe(user1.id, {x: 2, y: 2}),
				'HarrySoldierTwo': unitFactory.NewArcher(user1.id, {x: 1, y: 3}),
				'HarryCaptain': unitFactory.NewSword(user1.id, {x: 2, y: 4}),
				'HarrySoldierThree': unitFactory.NewArcher(user1.id, {x: 1, y: 5}),
				'HarrySoldierFour': unitFactory.NewSword(user1.id, {x: 2, y: 6}),
				'HarrySoldierFive': unitFactory.NewArcher(user1.id, {x: 1, y: 7}),
				'HarrySoldierSix': unitFactory.NewSpear(user1.id, {x: 2, y: 8}),
				
				'LaurieSoldierOne': unitFactory.NewSpear(user2.id, {x: 3, y: 2}),
				'LaurieSoldierTwo': unitFactory.NewArcher(user2.id, {x: 3, y: 3}),
				'LaurieCaptain': unitFactory.NewSword(user2.id, {x: 3, y: 4}),
				'LaurieSoldierThree': unitFactory.NewArcher(user2.id, {x: 3, y: 5}),
				'LaurieSoldierFour': unitFactory.NewSword(user2.id, {x: 3, y: 6}),
				'LaurieSoldierFive': unitFactory.NewArcher(user2.id, {x: 3, y: 7}),
				'LaurieSoldierSix': unitFactory.NewAxe(user2.id, {x: 3, y: 8}),
			};
		}
		
		var game = {
			turnTimer: setTimeout(function(){ TimeRunOut(game); }, turnTime * 1000),
			data: {
				id: gameId,
				turnTime: turnTime,
				lastTurnStart: (new Date()).getTime(),
				state: 0, //todo: Make game state enum available here
				activeUser: user2.id,
				userOrder: [user1.id, user2.id],
				users: {
				},
				units: units,
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

		game.data.users[user1.id] = {
			name: user1.name,
			connected: true,
			socketId: user1.socketId,
			team: user1.id
		};
		
		game.data.users[user2.id] = {
			name: user2.name,
			connected: true,
			socketId: user2.socketId,
			team: user2.id
		};
		
		return game;
	}

	/* Not sure if necessary anymore, why do I need games in an array? Maybe to poll to see if they're abandoned?
	var StartNewGame = function(user1, user2){
		var game = InitGame(user1, user2);
		
		games.push(game);
	} */

	var SendGameInit = function(socket, enemySockets, userId, game){
		game = inGamePlayers[userId];
		
		game.data.users[userId].connected = true;
		
		socket.emit('init', {inGame: true, serverTime: (new Date()).getTime(), game: game.data});
		
		for(var user in game.data.users)
			if(user.id != userId && game.data.users[user].connected){
				sockets[user].emit('process', {event: 'enemy connection resolve', data: true});
			}
	}
}