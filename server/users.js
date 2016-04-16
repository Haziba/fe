module.exports = function(db, bus){
	var _me = {
		getById: function(userId){
			return new Promise(function(resolve, reject){
				if(users[userId]){
					resolve(users[userId]);
				} else {
					db.getById(db.models.User, userId).then(function(user){
						if(user){
							user.inGame = false;
						}

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
	};

	var users = {};
	var usersInGame = {};

	bus.sub('game start', function(pendingGame){
		for(var i = 0; i < pendingGame.users.length; i++){
			_me.getById(id).then(function(user){
				user.inGame = true;
			});
		}
	});

	bus.sub('user connect', function(user){
		if(users[user.id])
			users[user.id].socketId = user.socketId;
		else
			_me.getById(user.id).then(function(user){
				users[user.id].socketId = user.socketId;
			});
	});

	return _me;
}
