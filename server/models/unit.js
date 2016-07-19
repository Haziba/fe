var enums = require('../../public/js/game/enums.js');

module.exports = {
	'modelVersion': 1,
	'collection': undefined,

	'new': function(type){
    var unit = {};
    var names = ["Herbert", "Sherbert", "Shirleybert", "Burlyshirt", "Shirley"];

    unit.name = names[Math.floor(Math.random() * names.length)];
    unit.type = type;

    unit.equipment = {};

    for(var slot in enums.EquipmentSlot)
      unit.equipment[enums.EquipmentSlot[slot]] = 0;

    unit.modelVersion = this.modelVersion;

    return unit;
  },

  'modelUpdate': function(unit){
    switch(unit.modelVersion){
      case 0:
        unit.equipment = {};
        for(var slot in enums.EquipmentSlot)
          unit.equipment[enums.EquipmentSlot[slot]] = 0;
    }

		unit.modelVersion = this.modelVersion;

		return unit;
  }
}
