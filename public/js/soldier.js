var NewSoldier = function(unitId, initUnit, teamNum, activeTeam)
{
	var _me = {id: unitId};
	var _selected = false;
	var _availableFights, _availableMoves;
	
	var _position = initUnit.pos;
	var _soldierType = initUnit.type;
	var _team = initUnit.team == teamNum;
	var _active = activeTeam == teamNum;
	var _waiting = initUnit.waiting;
	var _stats = initUnit.stats;
	
	var _displayMoves, _displayFights;
	
	var _actionsAvailable = {move: true, fight: true};
	
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
			if(!(_availableMoves[i].pos.x == _position.x && _availableMoves[i].pos.y == _position.y))
				_displayMoves.push(_availableMoves[i].pos);
				
		for(var i = 0; i < _availableFights.length; i++) {
			var fightPos = _availableFights[i].pos;
			var displayFight = true;
			for(var j = 0; j < _availableMoves.length; j++)
				if(fightPos.x == _availableMoves[j].pos.x && fightPos.y == _availableMoves[j].pos.y) {
					displayFight = false;
					break;
				}
			if(displayFight)
				_displayFights.push(fightPos);
		}
		console.log(_displayFights);
	}
	
	_me.SelectGround = function(position){
		if(!_selected)
			return;
		
		for(var i = 0; i < _availableMoves.length; i++)
			if(_availableMoves[i].pos.x == position.x && _availableMoves[i].pos.y == position.y){
				_me.MoveTo(position);
				
				if(!_actionsAvailable.fight)
					_waiting = false;
				_actionsAvailable.move = false;
			}
		
		_me.Deselect();
	}
	
	_me.SelectUnit = function(unit){
		if(!_selected)
			return;
		
		var position = unit.GetPosition();
		
		for(var i = 0; i < _availableFights.length; i++)
			if(_availableFights[i].pos.x == position.x && _availableFights[i].pos.y == position.y){
				if(!TileHelper.TilesInRange(_position, position, _me.AttackRange())){
					_me.MoveTo(_availableFights[i].movePos.pos);
					_actionsAvailable.move = false;
				}
				window.bus.pub('soldier fight start', {me: _me, enemy: unit});
				
				if(!_actionsAvailable.move)
					_waiting = false;
				_actionsAvailable.fight = false;
			}
		
		_me.Deselect();
	}
	
	_me.MoveTo = function(position){
		_position = {x: position.x, y: position.y};

		window.bus.pub('soldier move', _me);
	}
	
	_me.ResolveCombat = function(unit){
		_stats.health = unit.stats.health;
	}
	
	_me.MovementRange = function(){
		return 4;
	}
	
	_me.AttackRange = function(){
		return {min: 1, max: 1};
	}
	
	_me.Selectable = function(){
		return _team == Team.ME && _waiting && _active;
	}
	
	_me.Team = function(){
		return _team;
	}
	
	_me.GetPosition = function(){
		return {x: _position.x, y: _position.y};
	}
	
	_me.CanMove = function(){
		return _actionsAvailable.move;
	}
	
	_me.CanFight = function(){
		return _actionsAvailable.fight;
	}
	
	_me.Update = function(){
		// not currently needed
	}
	
	_me.Draw = function(){
		SpriteHandler.Draw(GetSprite(), {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()});
		
		if(!_waiting){
			SpriteHandler.Draw(Sprite.FADE_OUT, {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()});
		}
		
		SpriteHandler.Draw(_team == Team.ME ? Sprite.YOUR_UNIT : Sprite.THEIR_UNIT, {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()});
		
		SpriteHandler.Draw(Sprite.HEALTH_EMPTY, {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()});
		SpriteHandler.DrawInRect(Sprite.HEALTH_FULL, {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()}, {x: 0, y: 0, width: Global.TileSize() * (_stats.health / _stats.maxHealth), height: Global.TileSize()});
		
		if(!_selected)
			return;
		
		SpriteHandler.Draw(Sprite.SELECTION, {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()});
		
		for(var i = 0; i < _displayMoves.length; i++)
			SpriteHandler.Draw(Sprite.BLUE, {x: _displayMoves[i].x * Global.TileSize(), y: _displayMoves[i].y * Global.TileSize()});
		
		for(var i = 0; i < _displayFights.length; i++)
			SpriteHandler.Draw(Sprite.RED, {x: _displayFights[i].x * Global.TileSize(), y: _displayFights[i].y * Global.TileSize()});
	}
	
	window.bus.sub('turn end resolve', function(activeTeam){
		_waiting = true;
		
		_active = activeTeam == teamNum;
		
		_actionsAvailable = {move: true, fight: true}
	});
	
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