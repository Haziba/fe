module.exports =
{
	'modelVersion': 1,
	'collection': 'players',
	
	'new': function(userId, userName){
		var player = {};
		
		player.modelVersion = this.modelVersion;
		player.id = userId;
		player.name = userName;
		player.units = [0,1,3,2,3,1,0];
		
		return player;
	},

	'dbUpdate': function(player){
		switch(player.modelVersion){
			case 0:
				player.units = [0,1,3,2,3,1,0];
				break;
		}
		
		return player;
	}
}