module.exports = function(router, db){
	router.route('/login/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		var userData = {success: false};
		
		db.getById(db.models.Player, userId).then(function(player){
			if(player != null){
				userData.success = true;
				
				player.token = db.models.Player.newToken();
				
				db.set(db.models.Player, player);
			}
			
			userData.player = player;
			
			res.json(userData);
		}, function(error){
			console.log("Error! `" + error + "`");
		});
	});
}