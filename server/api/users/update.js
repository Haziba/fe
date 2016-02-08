module.exports = function(router, db){
	router.route('/update/:user_id').get(function(req, res){
		//todo: Check player exists
		
		var player = req.body;
		player.id = req.params.user_id;
		
		db.setPlayer(player).then(function(){
			res.json({"success": true});
		}, function(err){
			res.json({"success": false, "error": err});
		});
	});
}