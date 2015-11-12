var NewSoldierManager = function(units, teamNum){
	var _me = {id: Global.NewId()};
	
	var _soldiers = {};
	
	for(var unitId in units)
		_soldiers[unitId] = NewSoldier(unitId, units[unitId], teamNum);
	
	window.bus.sub('socket soldier move', function(data){
		_soldiers[data.id].MoveTo(data.pos);
	});
	
	window.bus.sub('soldier fight resolve', function(data){
		for(var unit in data)
			_soldiers[unit].ResolveCombat(data[unit]);
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