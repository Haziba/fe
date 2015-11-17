var NewSoldierManager = function(units, teamNum, activeTeam){
	var _me = {id: Global.NewId()};
	
	var _soldiers = {};
	
	for(var unitId in units)
		_soldiers[unitId] = NewSoldier(unitId, units[unitId], teamNum, activeTeam);
	
	window.bus.sub('soldier move resolve', function(data){
		_soldiers[data.unitId].MoveTo(data.pos);
	});
	
	window.bus.sub('soldier fight resolve', function(data){
		for(var unit in data)
			_soldiers[unit].ResolveCombat(data[unit]);
	});
	
	window.bus.sub('soldier done resolve', function(unitId){
		_soldiers[unitId].Done();
	});
	
	_me.Get = function(unitId){
		return _soldiers[unitId];
	}
	
	_me.Move = function(unitId, move){
		_soldiers[unitId].Move(move);
	}
	
	_me.ResolveFight = function(data){
		_soldiers[data.unitId].Fight(data);
		_soldiers[data.enemyUnitId].GetFought(data);
	}
	
	_me.TurnEnd = function(activeTeam){
		for(var unit in _soldiers)
			_soldiers[unit].TurnEnd();
	}
	
	_me.Update = function(){
		for(var unitId in _soldiers)
			_soldiers[unitId].Update();
	}
	
	_me.Draw = function(){
		for(var unitId in _soldiers)
			_soldiers[unitId].Draw();
	}
	
	return _me;
}