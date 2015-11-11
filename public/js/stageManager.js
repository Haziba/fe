var NewStageManager = function(initData) {
	var _me = {id: Global.NewId()};

	var _oldSoldierPositions = {};
	var _tiles = [];
	var _currentSelection;
	
	for(var i = 0; i < Global.ScreenSize().width; i++) {
		_tiles[i] = [];
		for(var j = 0; j < Global.ScreenSize().height; j++)
			_tiles[i][j] = initData.map[i][j] == 1 ? true : undefined;
	}
	
	var SelectUnit = function(unit){
		if(!unit.Selectable())
		{
			_currentSelection.SelectUnit(unit);
			return;
		}
		
		if(_currentSelection)
			_currentSelection.Deselect();
		
		_currentSelection = unit;
		
		var availableMoves = TileHelper.GetAvailableMoves(_tiles, unit);
		var availableFights = TileHelper.GetAvailableFights(unit, availableMoves);
		
		_currentSelection.Select(availableFights, availableMoves);
	}
	
	var SelectGround = function(position){
		if(!_currentSelection)
			return;
		
		_currentSelection.SelectGround(position);
	}
	
	window.bus.sub('soldier move', function(soldier){
		var oldPosition = _oldSoldierPositions[soldier.id];
		var newPosition = soldier.GetPosition();
		
		_tiles[oldPosition.x][oldPosition.y] = undefined;
		_tiles[newPosition.x][newPosition.y] = soldier;
		
		_oldSoldierPositions[soldier.id] = {x: newPosition.x, y: newPosition.y};
	});
	
	window.bus.sub('soldier place', function(soldier){
		var newPosition = soldier.GetPosition();
		
		_tiles[newPosition.x][newPosition.y] = soldier;
		
		_oldSoldierPositions[soldier.id] = {x: newPosition.x, y: newPosition.y};
	});
	
	window.bus.sub('cursor click', function(position){
		if(typeof(_tiles[position.x][position.y]) == 'object')
			SelectUnit(_tiles[position.x][position.y]);
		else
			SelectGround(position);
	});
	
	window.bus.sub('deselect', function(){
		_currentSelection = undefined;
	});
	
	_me.Draw = function(){
		if(!_currentSelection)
			return;
	
		var selectionPosition = _currentSelection.GetPosition();
		
		SpriteHandler.Draw(Sprite.SELECTION, selectionPosition.x, selectionPosition.y);
	}
	
	return _me;
}