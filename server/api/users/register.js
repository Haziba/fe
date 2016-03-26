module.exports = function(router, db, models){
	router.route('/register/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		
		db.getById(models.Player, userId).then(function(player){
			if(player != null){
				res.json({"success": false, "error": "ID taken"});
			} else {
				player = models.Player.new(userId, req.body.name);
				
				db.set(models.Player, player).then(function(player){
					res.json({"success": true, "player": player});
				}, function(err){
					res.json({"success": false, "error": err});
				});
			}
		});
	});
}