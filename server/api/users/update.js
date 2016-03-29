module.exports = function(router, db){
	router.route('/update/:user_id').post(function(req, res){
		var player = req.body;
		player.id = req.params.user_id;
		
		db.getById(db.models.Player, player.id).then(function(player){
			if(player != null){
				db.set(db.models.Player, player).then(function(){
					res.json({"success": true, "player": player});
				}, function(err){
					res.json({"success": false, "error": err});
				});
			} else {
				res.json({"success": false, "error": "Player does not exist"});
			}
		});
	});
}