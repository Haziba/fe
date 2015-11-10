var NewSoldier = function(_position, _soldierType, _team)
{
	var _me = {id: Global.NewId()};
	var _selected = false;
	var _availableFights, _availableMoves;
	
	var _displayMoves, _displayFights;
	
	var GetSprite = function(){
		switch(_soldierType)
		{
			case Soldier.SWORD:
				return Sprite.SWORD;
			case Soldier.AXE:
				return Sprite.AXE;
			case Soldier.SPEAR:
				return Sprite.SPEAR;
		}
	}
	
	_me.GetPosition = function(){
		return {x: _position.x, y: _position.y};
	}
	
	_me.Deselect = function(){
		_selected = false;
		
		_availableMoves = _availableFights = _displayFights = _displayMoves = [];
		
		window.bus.pub('deselect');
	}
	
	_me.Select = function(availableFights, availableMoves){
		_selected = true;
		
		_availableFights = availableFights;
		_availableMoves = availableMoves;
		
		_displayFights = [];
		_displayMoves = [];
		
		for(var i = 0; i < _availableMoves.length; i++)
			_displayMoves.push(_availableMoves[i]);
		
		for(var i = 0; i < _availableFights.length; i++) {
			var displayFight = true;
			for(var j = 0; j < _availableMoves.length; j++)
				if(_availableFights[i].x == _availableMoves[j].x && _availableFights[i].y == _availableMoves[j].y) {
					displayFight = false;
					break;
				}
			if(displayFight)
				_displayFights.push(_availableFights[i]);
		}
	}
	
	_me.SelectGround = function(position){
		if(!_selected)
			return;
		
		for(var i = 0; i < _availableMoves.length; i++)
			if(_availableMoves[i].x == position.x && _availableMoves[i].y == position.y)
			{
				_me.MoveTo(position);
		
				window.bus.pub('soldier move', _me);
			}
		
		_me.Deselect();
	}
	
	_me.MoveTo = function(position){
		_position = {x: position.x, y: position.y};
	}
	
	_me.MovementRange = function(){
		return 4;
	}
	
	_me.AttackRange = function(){
		return {min: 1, max: 1};
	}
	
	_me.Selectable = function(){
		return _team == Team.ME;
	}
	
	_me.Update = function(){
		// not currently needed
	}
	
	_me.Draw = function(){
		SpriteHandler.Draw(GetSprite(), {x: _position.x * 20, y: _position.y * 20});
		
		SpriteHandler.Draw(_team == Team.ME ? Sprite.YOUR_UNIT : Sprite.THEIR_UNIT, {x: _position.x * 20, y: _position.y * 20});
		
		if(!_selected)
			return;
		
		SpriteHandler.Draw(Sprite.SELECTION, {x: _position.x * 20, y: _position.y * 20});
		
		for(var i = 0; i < _displayMoves.length; i++)
			SpriteHandler.Draw(Sprite.BLUE, {x: _displayMoves[i].x * 20, y: _displayMoves[i].y * 20});
		
		for(var i = 0; i < _displayFights.length; i++)
			SpriteHandler.Draw(Sprite.RED, {x: _displayFights[i].x * 20, y: _displayFights[i].y * 20});
	}
	
	window.bus.pub('soldier place', _me);
	
	return _me;
}

var Soldier = {
	SWORD: 0,
	AXE: 1,
	SPEAR: 2
}

var Team = {
	ME: 0,
	ENEMY: 1
}