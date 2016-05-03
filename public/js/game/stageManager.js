var NewStageManager = function(initData) {
	var _me = {id: Global.NewId()};

	var _oldSoldierPositions, _tiles, _currentSelection;

	var init = function(game){
		_tiles = [];
		_oldSoldierPositions = {};
		_currentSelection = undefined;

		Global.SetScreenSize({width: game.map.length, height: game.map[0].length})

		for(var i = 0; i < Global.ScreenSize().width; i++) {
			_tiles[i] = [];
			for(var j = 0; j < Global.ScreenSize().height; j++)
				_tiles[i][j] = game.map[i][j] == 1 ? true : undefined;
		}
	}

	init(initData);

	var SelectUnit = function(unit){
		if(!unit.Controlable()){
			if(_currentSelection){
				_currentSelection.SelectUnit(unit);
				return;
			}
		}

		if(_currentSelection)
			_currentSelection.Deselect();

		_currentSelection = unit;

		if(unit.Controlable()){
			var availableMoves = unit.CanMove() ? TileHelper.GetAvailableMoves(_tiles, unit) : [{pos: unit.GetPosition()}];
			var availableFights = unit.CanFight() ? TileHelper.GetAvailableFights(_tiles, unit, availableMoves) : [];

			_currentSelection.Select(availableFights, availableMoves);
		}else{
			_currentSelection.Select([], []);
		}
	}

	var SelectGround = function(position){
		if(!_currentSelection)
			return;

		_currentSelection.SelectGround(position);
	}

	window.bus.sub('soldier place', function(soldier){
		var newPosition = soldier.GetPosition();

		_tiles[newPosition.x][newPosition.y] = soldier;

		_oldSoldierPositions[soldier.id] = {x: newPosition.x, y: newPosition.y};
	}, 'game');

	window.bus.sub('soldier remove', function(soldier){
		var position = soldier.GetPosition();

		_tiles[position.x][position.y] = undefined;
	}, 'game');

	window.bus.sub('cursor click', function(position){
		if(typeof(_tiles[position.x][position.y]) == 'object')
			SelectUnit(_tiles[position.x][position.y]);
		else
			SelectGround(position);
	}, 'game');

	window.bus.sub('deselect', function(){
		_currentSelection = undefined;
	}, 'game');

	_me.MoveUnit = function(unit, move){
		var oldPosition = _oldSoldierPositions[unit.id];
		var newPosition = move.pos;

		_tiles[oldPosition.x][oldPosition.y] = undefined;
		_tiles[newPosition.x][newPosition.y] = unit;

		_oldSoldierPositions[unit.id] = {x: newPosition.x, y: newPosition.y};
	}

	_me.ResetGame = function(game){
		init(game);
	}

	_me.Draw = function(){
		if(!_currentSelection)
			return;

		var selectionPosition = _currentSelection.GetPosition();

		SpriteHandler.Draw(Sprite.SELECTION, selectionPosition.x, selectionPosition.y);
	}

	return _me;
}
