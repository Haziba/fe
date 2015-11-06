var NewSoldierManager = function(){
	var _me = {};
	
	var _soldiers = [];
	
	_soldiers.push(NewSoldier(2, 4, Soldier.SWORD, Team.ME));
	_soldiers.push(NewSoldier(2, 7, Soldier.AXE, Team.ENEMY));
	
	_me.Update = function(){
		
	}
	
	_me.Draw = function(){
		for(var i = 0; i < _soldiers.length; i++)
			_soldiers[i].Draw();
	}
	
	return _me;
}