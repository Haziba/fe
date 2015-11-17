var NewAction = function(_action, _data){
	var _me = {};
	
	_me.Process = function(soldierManager, stageManager){
		switch(_action){
			case 'soldier move':
				SoldierMove(soldierManager, stageManager);
				break;
			case 'soldier fight':
				SoldierFight(soldierManager);
				break;
		}
	}
	
	var SoldierMove = function(soldierManager, stageManager){
		soldierManager.Move(_data.unitId, _data.move);
		stageManager.MoveUnit(soldierManager.Get(_data.unitId), _data.move);
		
		window.bus.pub('action complete');
	}
	
	var SoldierFight = function(soldierManager){
		soldierManager.ResolveFight(_data);
		
		window.bus.pub('action complete');
	}
	
	return _me;
}