module.exports = {
	'modelVersion': 1,
	'collection': undefined,

	'new': function(itemId, count){
    var inventoryItem = {};

    inventoryItem.itemId = itemId;
    inventoryItem.total = count;
    inventoryItem.available = count;

    inventoryItem.modelVersion = this.modelVersion;

    return inventoryItem;
  },

  'modelUpdate': function(inventoryItem){
    switch(inventoryItem.modelVersion){
      case 0:
        inventoryItem.total = inventoryItem.count;
        inventoryItem.available = inventoryItem.count;
        
        delete inventoryItem.count;
        break;
    }

		inventoryItem.modelVersion = this.modelVersion;

		return inventoryItem;
  }
}
