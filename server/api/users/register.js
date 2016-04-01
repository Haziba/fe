module.exports = function(router, db, users){
	router.route('/register/:user_id').post(function(req, res){
		console.log("Register");
		var userId = req.params.user_id;
		
		users.getById(userId).then(function(user){
			if(user != null){
				res.json({"success": false, "error": "ID taken"});
			} else {
				user = db.models.User.new(userId, req.body.name);
				
				users.set(user).then(function(user){
					res.json({"success": true, "user": user});
				}, function(err){
					res.json({"success": false, "error": err});
				});
			}
		});
	});
}