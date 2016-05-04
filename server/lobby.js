module.exports = function(bus){
	var usersLookingForGame = [];
	var pendingGames = [];

	var lookForGame = function(user){
		if(user.id === undefined || user.socketId === undefined){
			bus.pub('socket message', [user.socketId], 'lobby', {
				type: 'error'
			});
			return;
		}

		if(!!usersLookingForGame.find(function(u){ u.userId == user.userId }))
			return;

		usersLookingForGame.push(user);

		bus.sub('socket disconnect ' + user.socketId, function(){
			stopLookingForGame(user);
		});
	}

	var stopLookingForGame = function(user){
		var index = usersLookingForGame.indexOf(user);

		usersLookingForGame.splice(index, 1);
	}

	var acceptGame = function(user){
		//todo: Stop user accepting game multiple times
		for(var i = 0; i < pendingGames.length; i++){
			for(var j = 0; j < pendingGames[i].users.length; j++){
				if(pendingGames[i].users[j].id == user.id){
					pendingGames[i].acceptedUsers++;

					if(pendingGames[i].acceptedUsers == pendingGames[i].users.length){
						startGame(pendingGames[i]);
					}

					return;
				}
			}
		}
	}

	var rejectGame = function(user){
		for(var i = 0; i < pendingGames.length; i++){
			for(var j = 0; j < pendingGames[i].users.length; j++){
				if(pendingGames[i].users[j].id == user.id){
					cancelPendingGame(pendingGames[i], user.id);

					return;
				}
			}
		}
	}

	var matchUpPlayers = function(){
		var when = (new Date()).getTime();

		for(var i = usersLookingForGame.length - 2; i >= 0; i -= 2){
			var users = [usersLookingForGame[i], usersLookingForGame[i+1]];
			var sockets = users.map(function(user){ return user.socketId; });

			bus.pub('socket message', sockets, 'lobby', {
				type: 'foundGame',
				when: when
			});

			pendingGames.push({
				users: users,
				when: when,
				acceptedUsers: 0
			});

			usersLookingForGame.splice(i, 2);
		}
	}

	var cancelPendingGames = function(){
		var when = (new Date()).getTime();

		var endingGames = pendingGames.filter(function(game){
			return (when - game.when) > 15000;
		});

		for(var i = 0; i < endingGames.length; i++){
			cancelPendingGame(endingGames[i]);
		}
	}

	var cancelPendingGame = function(game, rejectingUserId){
		var sockets = game.users.map(function(user){ return user.socketId; });

		bus.pub('socket message', sockets, 'lobby', {
			type: 'pendingGameCancelled'
		});

		for(var j = 0; j < game.users.length; j++)
			if(game.users.id != rejectingUserId)
				usersLookingForGame.push(game.users[j]);

		pendingGames.splice(pendingGames.indexOf(game), 1);
	}

	var startGame = function(pendingGame){
		pendingGames.splice(pendingGames.indexOf(pendingGame), 1);

		var sockets = pendingGame.users.map(function(user){ return user.socketId; });

		bus.pub('socket message', sockets, 'lobby', {
			type: 'gameAccepted'
		});
		console.log('game start', pendingGame);
		bus.pub('game start', pendingGame);
	}

	bus.sub('lobby action', function(msg){
		switch(msg.type){
			case 'lookForGame':
				lookForGame(msg.user);
				break;
			case 'stopLookingForGame':
				stopLookingForGame(msg.user);
				break;
			case 'acceptGame':
				acceptGame(msg.user);
				break;
			case 'rejectGame':
				rejectGame(msg.user);
				break;
		}
	});

	setInterval(matchUpPlayers, 1);
	setInterval(cancelPendingGames, 1);
}
