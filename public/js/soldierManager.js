var NewSoldierManager = function(){
	var _me = {id: makeid()};
	
	var _soldiers = [];
	
	_soldiers.push(NewSoldier({x: 2, y: 4}, Soldier.SWORD, Team.ME));
	_soldiers.push(NewSoldier({x: 2, y: 7}, Soldier.AXE, Team.ENEMY));
	
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