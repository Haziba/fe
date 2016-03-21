module.exports = function(router, db){
	router.route('/login/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		var userData = {exists: false};
		
		db.getPlayer(userId).then(function(player){
			if(player != null)
				userData.exists = true;
			
			userData.player = player;
			
			res.json(userData);
		}, function(error){
			console.log("Error! `" + error + "`");
		});
	});
}