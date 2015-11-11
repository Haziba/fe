var NewSoldierManager = function(units, teamNum){
	var _me = {id: Global.NewId()};
	
	var _soldiers = [];
	
	for(var i = 0; i < units.length; i++)
		_soldiers.push(NewSoldier(units[i], teamNum));
	
	window.bus.sub('socket soldier move', function(data){
		for(var i = 0; i < _soldiers.length; i++)
			if(_soldiers[i].id == data.id)
				_soldiers[i].MoveTo(data.pos);
	});
	
	_me.Update = function(){
		for(var i = 0; i < _soldiers.length; i++)
			_soldiers[i].Update();
	}
	
	_me.Draw = function(){
		for(var i = 0; i < _soldiers.length; i++)
			_soldiers[i].Draw();
	}
	
	return _me;
}