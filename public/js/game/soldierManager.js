var NewSoldierManager = function(_units, _teamNum, _activeTeam){
	var _me = {id: Global.NewId()};

	var _soldiers = {};
	var _healthChangePause = 0;

	var init = function(units, activeTeam){
		_soldiers = {};

		for(var unitId in units)
			_soldiers[unitId] = NewSoldier(unitId, units[unitId], _teamNum, activeTeam);
	}

	init(_units, _activeTeam);

	window.bus.sub('soldier move resolve', function(data){
		_soldiers[data.unitId].MoveTo(data.pos);
	}, 'game');

	window.bus.sub('soldier fight resolve', function(data){
		for(var unit in data)
			_soldiers[unit].ResolveCombat(data[unit]);
	}, 'game');

	window.bus.sub('soldier done resolve', function(unitId){
		_soldiers[unitId].Done();
	}, 'game');

	_me.Get = function(unitId){
		return _soldiers[unitId];
	}

	_me.Move = function(unitId, move){
		_soldiers[unitId].Move(move);
	}

	_me.ResolveFight = function(data){
		window.bus.pub('fight start', _soldiers[data.unitId], _soldiers[data.enemyUnitId], data.attackOrder);

		_soldiers[data.unitId].Fight(data);
	}

	_me.ShowHealthChange = function(units){
		_healthChangePause = 0;

		for(var i = 0; i < units.length; i++){
			_healthChangePause = Math.max(_healthChangePause, _soldiers[units[i].unitId].ShowHealthChange(units[i].newHealth));
		}
	}

	_me.SoldierDone = function(unitId){
		_soldiers[unitId].Done();
	}

	_me.TurnEnd = function(_activeTeam){
		for(var unit in _soldiers)
			_soldiers[unit].TurnEnd(_activeTeam);
	}

	_me.ResetGame = function(game){
		init(game.units, game.activeTeam);
	}

	_me.Update = function(){
		for(var unitId in _soldiers)
			_soldiers[unitId].Update();

		if(_healthChangePause > 0){
			_healthChangePause--;

			if(_healthChangePause == 0)
				window.bus.pub('anim complete');
		}
	}

	_me.Draw = function(){
		for(var unitId in _soldiers)
			_soldiers[unitId].Draw();
	}

	return _me;
}
