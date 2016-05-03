var NewAction = function(_action, _data){
	var _me = { action: _action };

	_me.Process = function(soldierManager, stageManager, hud){
		switch(_action){
			case 'soldier move':
				SoldierMove(soldierManager, stageManager);
				break;
			case 'soldier fight':
				SoldierFight(soldierManager);
				break;
			case 'soldier done':
				SoldierDone(soldierManager);
				break;
			case 'turn end':
				TurnEnd(soldierManager, hud);
				break;
			case 'state change':
				StateChange(hud);
				break;
			case 'game reset':
				ResetGame(soldierManager, stageManager, hud);
				break;
		}
	}

	var SoldierMove = function(soldierManager, stageManager){
		soldierManager.Move(_data.unitId, _data.move);
		stageManager.MoveUnit(soldierManager.Get(_data.unitId), _data.move);

		window.bus.subOnce('anim complete', function(){
			window.bus.pub('action complete');
		}, 'game');
	}

	var SoldierFight = function(soldierManager){
		soldierManager.ResolveFight(_data);
debugger;
		window.bus.subOnce('anim complete', function(){


			window.bus.pub('action complete');
		}, 'game');
	}

	var SoldierDone = function(soldierManager){
		soldierManager.SoldierDone(_data);

		window.bus.pub('action complete');
	}

	var TurnEnd = function(soldierManager, hud){
		soldierManager.TurnEnd(_data.activeTeam);
		hud.TurnEnd(_data.activeTeam);

		window.bus.pub('action complete');
	}

	var StateChange = function(hud){
		hud.StateChange(_data);

		window.bus.pub('action complete');
	}

	var ResetGame = function(soldierManager, stageManager, hud){
		stageManager.ResetGame(_data);
		soldierManager.ResetGame(_data);
		hud.ResetGame(_data);

		window.bus.pub('action complete');
	}

	return _me;
}
