var NewSoldierManager = function(teamNum){
	var _me = {id: Global.NewId()};
	
	var _soldiers = [];
	
	_soldiers.push(NewSoldier({x: 2, y: 4}, Soldier.SWORD, teamNum == 0 ? Team.ME : Team.ENEMY));
	_soldiers.push(NewSoldier({x: 2, y: 7}, Soldier.AXE, teamNum == 0 ? Team.ENEMY : Team.ME));
	
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