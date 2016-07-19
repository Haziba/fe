module.exports = function(router, db, users){
	router.route('/:user_id/:unit_id/setItem/:slot/:item_id').post(function(req, res){
		var userId = req.params.user_id;

		users.getById(userId).then(function(user){
			var token = req.body.token;

			if(user != null){
				if(user.token == token){
          var unitId = req.params.unit_id;
          var slot = req.params.slot;
          var itemId = req.params.item_id;

          var itemAvailable = false;

          if(itemId > 0)
            for(var i = 0; i < user.inventory.length; i++){
              if(user.inventory[i].itemId == itemId && user.inventory[i].available > 0){
                itemAvailable = true;
                user.inventory[i].available--;
              }
            }
          else
            itemAvailable = true;

          if(itemAvailable){
            if(user.units[unitId].equipment[slot] > 0){
              for(var i = 0; i < user.inventory.length; i++){
                if(user.inventory[i].itemId == user.units[unitId].equipment[slot]){
                  user.inventory[i].available++;
                }
              }
            }

            user.units[unitId].equipment[slot] = itemId;

		        users.set(user).then(function(){
              console.log("Item changed", {userId: userId, slot: slot, unitId: unitId, itemId: itemId});
              res.json({success: true, user: user});
            }, function(){
              res.json({success: false, error: 'Failed to save user'});
            });
          } else {
            res.json({success: false, error: 'Item not in inventory'});
          }
				} else {
          console.log(user.token, token);
					res.json({success: false, error: 'Token mismatch'});
				}
			} else {
				res.json({success: false, error: 'User doesn\'t exist'});
			}
		});
	});
}
