module.exports = function(router, db, socket){
	router.route('/auth/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		
		db.getById(db.models.Player, userId).then(function(player){
			var token = req.body.token;
			
			if(player != null){
				if(player.token == token){
					var playerInGame = socket.isUserInGame(userId);
					
					res.json({success: true, player: player, inGame: playerInGame});
				} else {
					res.json({success: false, error: 'Token mismatch'});
				}
			} else {
				res.json({success: false, error: 'Player doesn\'t exist'})
			}
		});
	});
}