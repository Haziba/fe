module.exports = function(db, bus){
	var users = {};
	
	bus.sub('user update', function(user){
		users[user.id] = user;
	});
	
	return {
		getById: function(userId){
			return new Promise(function(resolve, reject){
				if(users[userId]){
					resolve(users[userId]);
				} else {
					db.getById(db.models.User, userId).then(function(user){
						users[userId] = user;
						
						resolve(users[userId]);
					});
				}
			});
		},
		
		set: function(user){
			users[user.id] = user;
			
			return db.set(db.models.User, user);
		},
		
		refreshToken: function(user){
			user.token = db.models.User.newToken();
		}
	}
}