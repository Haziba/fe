module.exports = function(router, users){
	router.route('/auth/:user_id').post(function(req, res){
		var userId = req.params.user_id;
		
		users.getById(userId).then(function(user){
			var token = req.body.token;
			
			if(user != null){
				if(user.token == token){
					res.json({success: true, user: user});
				} else {
					res.json({success: false, error: 'Token mismatch'});
				}
			} else {
				res.json({success: false, error: 'User doesn\'t exist'});
			}
		});
	});
}