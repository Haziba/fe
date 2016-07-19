var mongoClient = require('mongodb').MongoClient;

module.exports = function(models){
	return {
		_db: undefined,
		_init: false,

		models: models,

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

		all: function(model){
			var that = this;
			return new Promise(function(resolve, reject){
				if(!that._db)
					reject("DB not started");

				var cursor = that._db.collection(model.collection).find();

				var objs = [];

				cursor.each(function(err, obj){
					if(err != null)
						reject(err);
					else {
						if(obj != null){
							obj = model.modelUpdate(obj);

							that.set(model, obj);
						}

						if(obj != null){
							objs.push(obj);
						} else {
							resolve(objs);
						}
					}
				});
			})
		},

		getById: function(model, id){
			var that = this;

			return new Promise(function(resolve, reject){
				if(!that._db)
					reject("DB not started");

				var cursor = that._db.collection(model.collection).find({id: id});

				cursor.nextObject(function(err, obj){
					if(err != null)
						reject(err);
					else{
						if(obj != null){
							obj = model.modelUpdate(obj);

							that.set(model, obj);
						}

						resolve(obj);
					}
				});
			});
		},

		set: function(model, obj){
			var that = this;

			return new Promise(function(resolve, reject){
				if(!that._db){
					reject("DB not started");
				}

				that._db.collection(model.collection).update({id: obj.id}, obj, {upsert: true}, function(err, data){
					if(err != null){
						reject(err);
					}else
						resolve(obj);
				});
			});
		}
	};
}
