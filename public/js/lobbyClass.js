var StartLobby = function($lobbyWrapper, data){
	var $tableBody = $lobbyWrapper.find("tbody");
	
	var onlinePlayers = {};
	
	var ChallengePlayer = function(){
		var userId = $(this).closest("tr").find(".userId").text();
		
		window.bus.pub('lobby', {action: 'challenge', data: userId});
	}
	
	var AddPlayer = function(userId){
		onlinePlayers[userId] = $("<tr/>").append($("<td/>").text(userId).addClass("userId")).append($("<td/>").append($("<a/>").text("Challenge").click(ChallengePlayer)));
		
		$tableBody.append(onlinePlayers[userId]);
	}
	
	var RemovePlayer = function(userId){
		onlinePlayers[userId].remove();
		
		delete onlinePlayers[userId];
	}
	
	for(var i = 0; i < data.length; i++){
		if(data[i] != socketId)
			AddPlayer(data[i]);
	}
	
	window.bus.sub('lobby', function(action){
		switch(action.action){
			case 'logged-on':
				AddPlayer(action.data);
				break;
			case 'logged-out':
				RemovePlayer(action.data);
				break;
		}
	});
}