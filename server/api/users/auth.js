module.exports = function(router, db, models){
	router.route('/auth/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		
		db.getById(models.Player, userId).then(function(player){
			var token = req.body.token;
			
			if(player != null){
				if(player.token == token){
					res.json({success: true, player: player});
				} else {
					res.json({success: false, error: 'Token mismatch'});
				}
			} else {
				res.json({success: false, error: 'Player doesn\'t exist'})
			}
		});
	});
}