var mongoClient = require('mongodb').MongoClient;

module.exports = function(){
	return {
		_db: undefined,
		_init: false,
		
		initialise: function(url, callback){
			var that = this;
			
			mongoClient.connect(url, function(err, db){
				if(err == null)
					that._db = db;
				else
					that._err = err;
				
				if(callback)
					callback();
			});
			
			this._init = true;
		},
		
		getPlayer: function(id){
			var that = this;
			
			return new Promise(function(resolve, reject){
				if(!that._db)
					reject("DB not started");
				
				var cursor = that._db.collection('players').find({id: id});
				
				cursor.nextObject(function(err, player){
					if(err != null)
						reject(err);
					else
						resolve(player);
				});
			});
		},
		
		setPlayer: function(player){
			var that = this;
			
			return new Promise(function(resolve, reject){
				if(!that._db){
					reject("DB not started");
				}
				
				that._db.collection('players').update({id: player.id}, player, {upsert: true}, function(err, data){
					if(err != null){
						reject(err);
					}else
						resolve();
				});
			});
		}
	};
}