module.exports = function(bus){
	var socketsLookingForGame = [];
	var pendingGames = [];
	
	var lookForGame = function(socketId){
		socketsLookingForGame.push(socketId);
		
		bus.sub('socket disconnect ' + socketId, function(){
			stopLookingForGame(socketId);
		});
	}
	
	var stopLookingForGame = function(socketId){
		var index = socketsLookingForGame.indexOf(socketId);
		
		socketsLookingForGame.splice(index, 1);
	}
	
	var matchUpPlayers = function(){
		if(socketsLookingForGame.length < 1)
			return;
		
		var when = (new Date()).getTime();
		
		var sockets = [socketsLookingForGame[0]];
		
		bus.pub('socket message', sockets, {
			type: 'foundGame',
			when: when
		});
		
		socketsLookingForGame.splice(0, 1);
		
		pendingGames.push({sockets: sockets, when: when});
		return;
		for(var i = socketsLookingForGame.length - 2; i >= 0; i += 2){
			
			var sockets = [socketsLookingForGame[i], socketsLookingForGame[i+1]];
			
			bus.pub('socket message', sockets, {
				type: 'foundGame',
				when: when
			});
			
			socketsLookingForGame.splice(i, 2);
			
			pendingGames.push({sockets: sockets, when: when});
		}
	}
	
	var cancelPendingGames = function(){
		var when = (new Date()).getTime();
		
		var endingGames = pendingGames.filter(function(games){
			return (when - games.when) > 15;
		});
		
		for(var i = 0; i < endingGames.length; i++){
			bus.pub('socket message', endingGames.sockets, {
				type: 'pendingGameCancelled'
			});
			
			pendingGames.splice(pendingGames.indexOf(endingGames[i]), 1);
		}
	}
	
	bus.sub('lobby action', function(msg){
		switch(msg.type){
			case 'lookForGame':
				lookForGame(msg.socketId);
				break;
			case 'stopLookingForGame':
				stopLookingForGame(msg.socketId);
				break;
		}
	});
	
	setInterval(matchUpPlayers, 1);
	setInterval(cancelPendingGames, 1);
}