module.exports = function(router, db, models){
	router.route('/auth/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		
		db.getById(models.Player, userId).then(function(player){
			var token = req.body.token;
			
			if(player != null){
				if(player.token == token){
					res.json({success: true});
				}
			}
			
			res.json({success: false});
		});
	});
}