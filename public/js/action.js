var NewAction = function(_action, _data){
	var _me = {};
	
	_me.Process = function(soldierManager, stageManager, hud){
		switch(_action){
			case 'soldier move':
				SoldierMove(soldierManager, stageManager);
				break;
			case 'soldier fight':
				SoldierFight(soldierManager);
				break;
			case 'turn end':
				TurnEnd(soldierManager, hud);
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
	
	var TurnEnd = function(soldierManager, hud){
		soldierManager.TurnEnd(_data);
		hud.TurnEnd(_data);
		
		window.bus.pub('action complete');
	}
	
	return _me;
}