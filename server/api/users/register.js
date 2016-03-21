module.exports = function(router, db){
	router.route('/register/:user_id').post(function(req, res){
		//todo: Check player doesn't exist
	
		var player = req.body;
		player.id = req.params.user_id;
		
		db.setPlayer(player).then(function(){
			res.json({"success": true});
		}, function(err){
			res.json({"success": false, "error": err});
		});
	});
}