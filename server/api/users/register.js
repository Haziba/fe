module.exports = function(router, db){
	router.route('/register/:user_id').post(function(req, res){
		console.log("Register");
		var userId = req.params.user_id;
		
		db.getById(db.models.Player, userId).then(function(player){
			if(player != null){
				res.json({"success": false, "error": "ID taken"});
			} else {
				player = db.models.Player.new(userId, req.body.name);
				
				db.set(db.models.Player, player).then(function(player){
					res.json({"success": true, "player": player});
				}, function(err){
					res.json({"success": false, "error": err});
				});
			}
		});
	});
}