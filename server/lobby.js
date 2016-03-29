module.exports = function(bus){
	var usersLookingForGame = [];
	var pendingGames = [];
	
	var lookForGame = function(user){
		usersLookingForGame.push(user.socketId);
		
		bus.sub('socket disconnect ' + user.socketId, function(){
			stopLookingForGame(user);
		});
	}
	
	var stopLookingForGame = function(user){
		var index = usersLookingForGame.indexOf(user);
		
		usersLookingForGame.splice(index, 1);
	}
	
	var acceptGame = function(user){
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
	
	var matchUpPlayers = function(){
		if(usersLookingForGame.length < 1)
			return;
		
		var when = (new Date()).getTime();
		
		var sockets = [usersLookingForGame[0].socketId];
		
		bus.pub('socket message', sockets, 'lobby', {
			type: 'foundGame',
			when: when
		});
		
		usersLookingForGame.splice(0, 1);
		
		pendingGames.push({sockets: sockets, when: when, acceptedUsers: 0});
		return;
		
		for(var i = usersLookingForGame.length - 2; i >= 0; i += 2){
			var users = [usersLookingForGame[i], usersLookingForGame[i+1]];
			var sockets = users.map(function(user){ return user.socketId; });
			
			bus.pub('socket message', sockets, 'lobby', {
				type: 'foundGame',
				when: when
			});
			
			usersLookingForGame.splice(i, 2);
			
			pendingGames.push({users: users, when: when});
		}
	}
	
	var cancelPendingGames = function(){
		var when = (new Date()).getTime();
		
		var endingGames = pendingGames.filter(function(games){
			return (when - games.when) > 15;
		});
		
		for(var i = 0; i < endingGames.length; i++){
			var sockets = endingGames[i].users.map(function(user){ return user.socketId; });
		
			bus.pub('socket message', sockets, 'lobby', {
				type: 'pendingGameCancelled'
			});
			
			for(var j = 0; j < endingGames[i].users.length; j++)
				usersLookingForGame.push(endingGames[i].users[j]);
			
			pendingGames.splice(pendingGames.indexOf(endingGames[i]), 1);
		}
	}
	
	var startGame = function(pendingGame){
		pendingGames.splice(pendingGames.indexOf(pendingGame), 1);
		
		var sockets = pendingGames.users.map(function(user){ return user.socketId; });
		
		bus.pub('socket message', sockets, 'lobby', {
			type: 'gameAccepted'
		});
		
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
		}
	});
	
	setInterval(matchUpPlayers, 1);
	setInterval(cancelPendingGames, 1);
}