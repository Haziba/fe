module.exports = function(router, db, users){
	router.route('/update/:user_id').post(function(req, res){
		var user = req.body;
		user.id = req.params.user_id;
		
		users.getById(user.id).then(function(user){
			if(user != null){
				users.update(user).then(function(){
					res.json({"success": true, "user": user});
				}, function(err){
					res.json({"success": false, "error": err});
				});
			} else {
				res.json({"success": false, "error": "User does not exist"});
			}
		});
	});
}