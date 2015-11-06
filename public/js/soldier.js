var NewSoldier = function(_position, _soldierType, _team)
{
	var _me = {id: makeid()};
	var _selected = false;
	
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
	}
	
	_me.Select = function(){
		_selected = true;
	}
	
	_me.SelectGround = function(position){
		if(!_selected)
			return;
		
		_position = {x: position.x, y: position.y};
		
		window.bus.pub('soldier move', _me);
	}
	
	_me.Update = function(){
		// not currently needed
	}
	
	_me.Draw = function(){
		SpriteHandler.Draw(GetSprite(), {x: _position.x * 20, y: _position.y * 20});
		
		SpriteHandler.Draw(_team == Team.ENEMY ? Sprite.YOUR_UNIT : Sprite.THEIR_UNIT, {x: _position.x * 20, y: _position.y * 20});
		if(_selected)
			SpriteHandler.Draw(Sprite.SELECTION, {x: _position.x * 20, y: _position.y * 20});
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