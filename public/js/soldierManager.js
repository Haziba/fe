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