module.exports =
{
	'modelVersion': 2,
	'collection': 'players',
	
	'new': function(userId, userName){
		var player = {};
		
		player.modelVersion = this.modelVersion;
		player.id = userId;
		player.name = userName;
		player.units = [0,1,3,2,3,1,0];
		player.token = newToken();
		
		return player;
	},

	'dbUpdate': function(player){
		switch(player.modelVersion){
			case 0:
				player.units = [0,1,3,2,3,1,0];
			case 1:
				player.token = this.newToken();
		}
		
		player.modelVersion = this.modelVersion;
		
		return player;
	},
	
	'newToken': function(){
		var token = '';

		for(var i = 0; i < 2; i++)
			token += Math.random().toString(36).substr(2);
		
		return token;
	}
}