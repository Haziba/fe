module.exports =
{
	'modelVersion': 3,
	'collection': 'users',
	
	'new': function(userId, userName){
		var user = {};
		
		user.modelVersion = this.modelVersion;
		user.id = userId;
		user.name = userName;
		user.units = [0,1,3,2,3,1,0];
		user.token = this.newToken();
		user.fbLogins = 0;
		
		return user;
	},

	'dbUpdate': function(user){
		switch(user.modelVersion){
			case 0:
				user.units = [0,1,3,2,3,1,0];
			case 1:
				user.token = this.newToken();
			case 2:
				user.fbLogins = 0;
		}
		
		user.modelVersion = this.modelVersion;
		
		return user;
	},
	
	'newToken': function(){
		var token = '';

		for(var i = 0; i < 2; i++)
			token += Math.random().toString(36).substr(2);
		
		return token;
	}
}