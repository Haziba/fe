var unit = require('./unit.js');
var inventoryItem = require('./inventoryItem.js');
var enums = require('../../public/js/game/enums.js');
var libraries = require('../libraries.js')();

module.exports =
{
	'modelVersion': 12,
	'collection': 'users',

	'new': function(userId, userName){
		var user = {};

		user.modelVersion = this.modelVersion;
		user.id = userId;
		user.name = userName;

		user.units = [];
		for(var i = 0; i < 3; i++)
			user.units.push(unit.new(enums.Unit.BARBARIAN));

		user.inventory = [inventoryItem.new(libraries.Item.getByName("Wooden Sword").id, 1)];

		user.token = this.newToken();
		user.fbLogins = 0;
		user.localLogins = 0;

		return user;
	},

	'modelUpdate': function(user){
		switch(user.modelVersion){
			case 1:
				user.token = this.newToken();
			case 2:
				user.fbLogins = 0;
			case 3:
				user.localLogins = 0;
			case 7:
				user.units = [];
				for(var i = 0; i < 3; i++)
					user.units.push(unit.new(enums.Unit.BARBARIAN));
			case 10:
				user.inventory = [inventoryItem.new(libraries.Item.getByName("Wooden Sword").id, 1)];
			case 11:
				user.levelStatus = [];
		}

		user.modelVersion = this.modelVersion;

		for(var i = 0; i < user.units.length; i++)
			user.units[i] = unit.modelUpdate(user.units[i]);
		for(var i = 0; i < user.inventory.length; i++)
			user.inventory[i] = inventoryItem.modelUpdate(user.inventory[i]);

		return user;
	},

	'newToken': function(){
		var token = '';

		for(var i = 0; i < 2; i++)
			token += Math.random().toString(36).substr(2);

		return token;
	}
}
