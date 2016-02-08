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
		}
	};
}