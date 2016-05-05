var NewSoldier = function(unitId, initUnit, teamNum, activeTeam)
{
	var _me = {id: unitId};
	var _selected = false;
	var _availableFights, _availableMoves;

	var _position = initUnit.pos;
	var _location = {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()};
	var _soldierType = initUnit.type;
	var _team = initUnit.team;
	var _active = activeTeam == teamNum;
	var _waiting = initUnit.waiting;
	var _stats = initUnit.stats;

	var _displayMoves, _displayFights;

	var _alive = initUnit.stats.health > 0;

	var _queuedMovementSteps = [];
	var _speed = 2.5;
	var _doneAfterMoving = false;

	var _healthChangeAnim;

	var GetSprite = function(){
		switch(_soldierType)
		{
			case Soldier.SWORD:
				return Sprite.SWORD;
			case Soldier.AXE:
				return Sprite.AXE;
			case Soldier.SPEAR:
				return Sprite.SPEAR;
			case Soldier.ARCHER:
				return Sprite.ARCHER;
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

		window.bus.pub('select', _me);
	}

	_me.SelectGround = function(position){
		if(!_selected)
			return;

		for(var i = 0; i < _availableMoves.length; i++)
			if(_availableMoves[i].pos.x == position.x && _availableMoves[i].pos.y == position.y){
				window.bus.pub('action new', {action: 'soldier move', data: {unitId: _me.id, move: _availableMoves[i]}});
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
					window.bus.pub('action new', {action: 'soldier move', data: {unitId: _me.id, move: _availableFights[i].movePos}});
				}
				window.bus.pub('action new', {action: 'soldier fight', data: {unitId: _me.id, enemyUnitId: unit.id}});
			}

		_me.Deselect();
	}

	_me.Move = function(move){
		var steps = move.steps;

		_stats.moves.remaining -= steps;

		_doneAfterMoving = false;
		if(_stats.moves.remaining == 1)
			if(_stats.fights.remaining == 0 || !move.fightable)
				_doneAfterMoving = true;

		_queuedMovementSteps = move.path;

		_position = move.pos;
	}

	_me.SkipMove = function(){
		_position = _queuedMovementSteps[_queuedMovementSteps.length-1];
		_location = {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()};

		_queuedMovementSteps = [];

		window.bus.pub('anim complete');
	}

	_me.Fight = function(fight){
		_stats.fights.remaining--;

		if(_stats.moves.remaining + _stats.fights.remaining == 0)
			_waiting = false;
	}

	var ResolveHealthChange = function(health){
		_stats.health = health;

		if(_stats.health == 0){
			_alive = false;
			window.bus.pub('soldier remove', _me);
		}
	}

	_me.TurnEnd = function(activeTeam){
		_waiting = true;

		_active = activeTeam == teamNum;

		_me.Deselect();

		_stats.moves.remaining = _stats.moves.max;
		_stats.fights.remaining = _stats.fights.max;
	}

	_me.MovementBlocking = function(teamNum){
		if(_team != teamNum)
			return true;
		return false;
	}

	_me.Done = function(){
		_stats.moves.remaining = 0;
		_stats.fights.remaining = 0;

		_waiting = false;
	}

	_me.ShowHealthChange = function(newHealth){
		if(newHealth == _stats.health)
			return 0;

		_healthChangeAnim = {
			diff: newHealth - _stats.health,
			currentLocation: {x: _location.x + Global.TileSize() / 2, y: _location.y + Global.TileSize() / 8},
			targetLocation: {x: _location.x, y: _location.y - Global.TileSize() / 2},
			steps: 40,
			newHealth: newHealth
		};

		return 40;
	}

	_me.SkipHealthChange = function(){
		if(_healthChangeAnim){
			ResolveHealthChange(_healthChangeAnim.newHealth);

			_healthChangeAnim = undefined;
		}
	}

	_me.MovementRange = function(){
		return _stats.moves.remaining;
	}

	_me.AttackRange = function(){
		if(_soldierType == Soldier.ARCHER)
			return {min: 1.4, max: 2};
		return {min: 1, max: 1};
	}

	_me.Controlable = function(){
		return _team == teamNum && _waiting && _active;
	}

	_me.Team = function(){
		return _team;
	}

	_me.GetPosition = function(){
		return {x: _position.x, y: _position.y};
	}

	_me.GetCentralLocation = function(){
		return {x: _location.x + Global.TileSize() / 2, y: _location.y + Global.TileSize() / 2};
	}

	_me.CanMove = function(){
		return _stats.moves.remaining > 0;
	}

	_me.CanFight = function(){
		return _stats.fights.remaining > 0;
	}

	_me.Stats = function(){
		return _stats;
	}

	_me.SpriteType = function(){
		return GetSprite();
	}

	var animateMovement = function(){
		var nextLoc = {x: _queuedMovementSteps[0].x * Global.TileSize(), y: _queuedMovementSteps[0].y * Global.TileSize()};

		if(nextLoc.x > _location.x)
			_location.x = Math.min(nextLoc.x, _location.x + _speed);
		if(nextLoc.x < _location.x)
			_location.x = Math.max(nextLoc.x, _location.x - _speed);
		if(nextLoc.y > _location.y)
			_location.y = Math.min(nextLoc.y, _location.y + _speed);
		if(nextLoc.y < _location.y)
			_location.y = Math.max(nextLoc.y, _location.y - _speed);

		if(nextLoc.x == _location.x && nextLoc.y == _location.y){
			_queuedMovementSteps.splice(0, 1);

			if(_queuedMovementSteps.length == 0){
				if(_doneAfterMoving)
					_waiting = false;

				window.bus.pub('anim complete');
			}
		}
	}

	var animateHealthChange = function(){
		_healthChangeAnim.currentLocation.y += (_healthChangeAnim.targetLocation.y - _healthChangeAnim.currentLocation.y) / _healthChangeAnim.steps;

		_healthChangeAnim.steps--;

		if(_healthChangeAnim.steps <= 0){
			ResolveHealthChange(_healthChangeAnim.newHealth);
			_healthChangeAnim = null;
		}
	}

	_me.Update = function(){
		if(_queuedMovementSteps.length > 0)
			animateMovement();

		if(_healthChangeAnim)
			animateHealthChange();

		if(_alive)
			InputHandler.AddClickableArea({x: _location.x, y: _location.y, width: Global.TileSize(), height: Global.TileSize()});
	}

	_me.Draw = function(){
		if(!_alive)
			// Show gravestone maybe?
			return;

		SpriteHandler.Draw(GetSprite(), _location);

		if(!_waiting){
			SpriteHandler.Draw(Sprite.FADE_OUT, _location);
		}

		SpriteHandler.Draw(_team == teamNum ? Sprite.YOUR_UNIT : Sprite.THEIR_UNIT, _location);

		SpriteHandler.Draw(Sprite.HEALTH_EMPTY, _location);
		SpriteHandler.DrawInRect(Sprite.HEALTH_FULL, _location, {x: 0, y: 0, width: Global.TileSize() * (_stats.health / _stats.maxHealth), height: Global.TileSize()});

		if(_healthChangeAnim){
			var context = SpriteHandler.GetContext();

			context.fillStyle = 'red';
			context.font = '18px Arial red';
			context.textAlign = 'center';
			context.fillText(_healthChangeAnim.diff, _healthChangeAnim.currentLocation.x, _healthChangeAnim.currentLocation.y);
		}

		if(!_selected)
			return;

		SpriteHandler.Draw(Sprite.SELECTION, {x: _position.x * Global.TileSize(), y: _position.y * Global.TileSize()});

		for(var i = 0; i < _displayMoves.length; i++)
			SpriteHandler.Draw(Sprite.BLUE, {x: _displayMoves[i].x * Global.TileSize(), y: _displayMoves[i].y * Global.TileSize()});

		for(var i = 0; i < _displayFights.length; i++)
			SpriteHandler.Draw(Sprite.RED, {x: _displayFights[i].x * Global.TileSize(), y: _displayFights[i].y * Global.TileSize()});
	}

	if(_alive)
		window.bus.pub('soldier place', _me);

	return _me;
}
