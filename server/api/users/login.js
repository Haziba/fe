module.exports = function(router, db, models){
	router.route('/login/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		var userData = {success: false};
		
		db.getById(models.Player, userId).then(function(player){
			if(player != null){
				userData.success = true;
				
				player.token = models.Player.newToken();
				
				db.set(models.Player, player);
			}
			
			userData.player = player;
			
			res.json(userData);
		}, function(error){
			console.log("Error! `" + error + "`");
		});
	});
}