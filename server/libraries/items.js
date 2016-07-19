var enums = require('../../public/js/game/enums.js');

module.exports = function(){
	var _me = {
		all: function(){
      return items;
		},

		getById: function(itemId){
      return items[itemId];
		},

		getByName: function(name){
			for(var id in items)
				if(items[id].name == name)
					return items[id];

			console.log("Unable to find item `" + name + "`");
			return null;
		},
	};

  var newItem = function(id, name, equipmentSlot){
    items[id] = {
			id: id,
      name: name,
      equipmentSlot: equipmentSlot,
    };
  }

	var items = {};

  newItem(1, "Wooden Sword", enums.EquipmentSlot.LEFT_HAND);

	return _me;
}
