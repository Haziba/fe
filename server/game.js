var enums = require('../public/js/game/enums.js');
var unitFactory = require('./unitFactory.js')(enums);
var worlds = require('./worlds.js')();
var verify = require('./verify.js')();

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
					if(!verify(game, msg))
						return;

					/*console.log("----" + msg.user.name + "----");*/
					var response = ProcessAction(game, msg);
					/*console.log("----RESPONSE----");
					console.log(response);*/

					var gameEnd = CheckForGameEnd(game);

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

					if(gameEnd){
						bus.pub('socket message', sockets, 'game', {
							type: 'action',
							data: {
								action: 'state change',
								response: {
									state: game.data.state,
									winningTeam: game.data.winningTeam
								}
							}
						});

						GameEnd(game);
					}else if(autoTurnEnd){
						bus.pub('socket message', sockets, 'game', {
							type: 'action',
							data: {
								action: 'turn end',
								response: { activeTeam: game.data.activeTeam }
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
			console.log('game reconnect', user.id);
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

			gameSockets.push(user.socketId);

			if(game.autoCloseGameTimer){
				console.log('clear timeout');
				clearTimeout(game.autoCloseGameTimer);
				game.autoCloseGameTimer = undefined;
			}
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

			gameSockets.splice(gameSockets.indexOf(game.data.users[user.id].socketId), 1);

			var usersConnected = 0;
			for(var userId in game.data.users){
				if(game.data.users[userId].connected)
					usersConnected++;
			}

			if(usersConnected == 0)
				game.autoCloseGameTimer = setTimeout(function(){
					GameEnd(game);
				}, 5 * 60 * 1000);
		}, 'game ' + game.id);
	}

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
		}
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
		var attacks = [];

		enemyUnit.stats.health = Math.max(enemyUnit.stats.health - Math.max(myUnit.stats.strength - enemyUnit.stats.armour, 0), 0);
		attacks.push(fight.unitId);

		if(enemyUnit.combatRetaliation && InMeleeRange(myUnit, enemyUnit))
			if(enemyUnit.stats.health > 0){
				myUnit.stats.health = Math.max(myUnit.stats.health - Math.max(enemyUnit.stats.strength - myUnit.stats.armour, 0), 0);
				attacks.push(fight.enemyUnitId);
			}

		fight.health = myUnit.stats.health;
		fight.enemyHealth = enemyUnit.stats.health;

		myUnit.stats.fights.remaining--;

		if(myUnit.stats.fights.remaining == 0 && myUnit.stats.moves.remaining == 1)
			myUnit.waiting = false;

		fight.attackOrder = attacks;

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

		var nextUser = game.data.userOrder.indexOf(game.data.activeTeam) + 1;

		game.data.activeTeam = nextUser >= game.data.userOrder.length ? game.data.userOrder[0] : game.data.userOrder[nextUser];

		clearTimeout(game.turnTimer);
		game.turnTimer = setTimeout(function(){ TimeRunOut(game); }, game.data.turnTime * 1000);
		game.data.lastTurnStart = (new Date()).getTime();

		return { activeTeam: game.data.activeTeam };
	}

	var GameEnd = function(game){
		bus.pub('game close', game.data);

		clearTimeout(game.turnTimer);

		bus.clearGroup('game ' + game.id);

		// Not sure if this actually does anything lel
		delete game;
	}

	var TimeRunOut = function(game){
		if(!game)
			return;

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

	var InMeleeRange = function(myUnit, enemyUnit){
		return (enemyUnit.pos.x == myUnit.pos.x && Math.abs(enemyUnit.pos.y - myUnit.pos.y) == 1)
			|| (Math.abs(enemyUnit.pos.x - myUnit.pos.x) == 1 && enemyUnit.pos.y == myUnit.pos.y);
	}

	var CheckForGameEnd = function(game){
		for(var i = 0; i < game.data.ships.length; i++){
			var ship = game.data.ships[i];

			for(var unitId in game.data.units){
				var unit = game.data.units[unitId];

				if(ship.pos.x == unit.pos.x && ship.pos.y == unit.pos.y && ship.team != unit.team){
					game.data.winningTeam = unit.team;
					game.data.state = enums.GameState.FINISHED_SHIP;
				}
			}
		}

		for(var userId in game.data.users){
			if(RemainingLivingUnitsFor(game, userId) <= 0){
				game.data.state = enums.GameState.FINISHED_SLAUGHTER;
				//todo: lol
				game.data.winningTeam = Object.keys(game.data.users).find(function(enemyUserId){ return enemyUserId != userId; });
			}
		}

		return game.data.state != enums.GameState.PLAYING;
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

	var InitGame = function(gameId, user1, user2){
		var turnTime = 45;

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
			turnTime = 5000;

			units = {
				'HarrySoldierOne': unitFactory.NewAxe(user1.id, {x: 2, y: 2}),
				/*'HarrySoldierTwo': unitFactory.NewArcher(user1.id, {x: 1, y: 3}),
				'HarryCaptain': unitFactory.NewSword(user1.id, {x: 2, y: 4}),
				'HarrySoldierThree': unitFactory.NewArcher(user1.id, {x: 1, y: 5}),
				'HarrySoldierFour': unitFactory.NewSword(user1.id, {x: 2, y: 6}),
				'HarrySoldierFive': unitFactory.NewArcher(user1.id, {x: 1, y: 7}),
				'HarrySoldierSix': unitFactory.NewSpear(user1.id, {x: 2, y: 8}),*/

				'LaurieSoldierOne': unitFactory.NewArcher(user2.id, {x: 3, y: 2}),
				/*'LaurieSoldierTwo': unitFactory.NewArcher(user2.id, {x: 3, y: 3}),
				'LaurieCaptain': unitFactory.NewSword(user2.id, {x: 3, y: 4}),
				'LaurieSoldierThree': unitFactory.NewArcher(user2.id, {x: 3, y: 5}),
				'LaurieSoldierFour': unitFactory.NewSword(user2.id, {x: 3, y: 6}),
				'LaurieSoldierFive': unitFactory.NewArcher(user2.id, {x: 3, y: 7}),
				'LaurieSoldierSix': unitFactory.NewAxe(user2.id, {x: 3, y: 8}),*/
			};
		}

		var game = {
			turnTimer: setTimeout(function(){ TimeRunOut(game); }, turnTime * 1000),
			autoCloseGameTimer: undefined,
			data: {
				id: gameId,
				turnTime: turnTime,
				lastTurnStart: (new Date()).getTime(),
				state: 0, //todo: Make game state enum available here
				activeTeam: user2.id,
				userOrder: [user1.id, user2.id],
				users: {
				},
				units: units,
				ships: [
					{
						team: user1.id,
						pos: {
							x: 0,
							y: 5
						}
					},
					{
						team: user2.id,
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
