module.exports = function(router, users){
	router.route('/login/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		var userData = {success: false};
		
		users.getById(userId).then(function(user){
			if(user != null){
				userData.success = true;
				
				users.refreshToken(user);
				
				users.set(user);
			}
			
			userData.user = user;
			
			res.json(userData);
		}, function(error){
			console.log("Error! `" + error + "`");
		});
	});
}