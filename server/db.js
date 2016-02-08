var mongoClient = require('mongodb').MongoClient;

module.exports = function(){
	return {
		_db: undefined,
		_init: false,
		
		initialise: function(url){
			var that = this;
			console.log("Attempt with: `" + url + "`");
			mongoClient.connect(url, function(err, db){
				console.log("Err: `" + err + "`");
				if(err == null)
					that._db = db;
				else
					that._err = err;
			});
			
			this._init = true;
		}
	};
}