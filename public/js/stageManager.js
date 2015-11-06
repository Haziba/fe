var NewStageManager = function() {
	var _me = {};

	var oldSoldierPositions = {};
	var tiles = [];
	var currentSelection;
	
	for(var i = 0; i < 35; i++) {
		tiles[i] = [];
		for(var j = 0; j < 25; j++)
			tiles[i][j] = undefined;
	}
	
	window.bus.sub('soldier move', function(soldier){
		var oldPosition = oldSoldierPositions[soldier];
		var newPosition = soldier.GetPosition();
		
		tiles[oldPosition.x][newPosition.y] = soldier;
		tiles[newPosition.x][newPosition.y] = soldier;
		
		oldSoldierPositions[soldier] = newPosition;
	});
	
	window.bus.sub('soldier place', function(soldier){
		var newPosition = soldier.GetPosition();
		
		tiles[newPosition.x][newPosition.y] = soldier;
		
		oldSoldierPositions[soldier] = newPosition;
	});
	
	window.bus.sub('cursor click', function(position){
		if(!tiles[position.x][position.y])
			return;
		
		if(currentSelection)
			currentSelection.Deselect();
		tiles[position.x][position.y].Select();
		
		currentSelection = tiles[position.x][position.y];
	});
	
	_me.Draw = function(){
		if(!currentSelection)
			return;
	
		var selectionPosition = currentSelection.GetPosition();
		
		SpriteHandler.Draw(Sprite.SELECTION, selectionPosition.x, selectionPosition.y);
	}
	
	return _me;
}