var StartLobby = function($lobbyWrapper, data){
	var $tableBody = $lobbyWrapper.find("tbody");
	
	var onlinePlayers = {};
	
	var ChallengePlayer = function(){
		var userId = $(this).closest("tr").data("id");
		
		window.bus.pub('lobby', {action: 'challenge', data: userId});
	}
	
	var AddPlayer = function(user){
		onlinePlayers[user.id] = $("<tr/>")
			.data("id", user.id)
			.append($("<td/>")
				.text(user.name)
				.addClass("userId"))
			.append($("<td/>")
				.append($("<a/>")
				.text("Challenge")
				.click(ChallengePlayer)));
		
		$tableBody.append(onlinePlayers[user.id]);
	}
	
	var RemovePlayer = function(user){
		onlinePlayers[user.id].remove();
		
		delete onlinePlayers[user.id];
	}
	
	for(var i = 0; i < data.length; i++){
		if(data[i].id != Global.player.id)
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