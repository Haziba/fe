var NewAction = function(_action, _data){
	var _me = { action: _action };

	_me.Process = function(soldierManager, stageManager, hud){
		var processing;

		window.bus.subOnce('action skip', function(){
			processing.skip();
		}, 'action-skip');

		window.bus.subOnce('action complete', function(){
			window.bus.clearGroup('action-skip');
		});

		window.bus.pub('action start');

		switch(_action){
			case 'soldier move':
				processing = SoldierMove(soldierManager, stageManager);
				break;
			case 'soldier fight':
				processing = SoldierFight(soldierManager);
				break;
			case 'soldier done':
				processing = SoldierDone(soldierManager);
				break;
			case 'turn end':
				processing = TurnEnd(soldierManager, hud);
				break;
			case 'state change':
				processing = StateChange(hud);
				break;
			case 'game reset':
				processing = ResetGame(soldierManager, stageManager, hud);
				break;
		}
	}

	var SoldierMove = function(soldierManager, stageManager){
		soldierManager.Move(_data.unitId, _data.move);
		stageManager.MoveUnit(soldierManager.Get(_data.unitId), _data.move);

		window.bus.subOnce('anim complete', function(){
			window.bus.pub('action complete');
		}, 'game');

		return {
			skip: function(){
				soldierManager.SkipMove(_data.unitId);
			}
		}
	}

	var SoldierFight = function(soldierManager){
		var stage = 'fight';

		soldierManager.ResolveFight(_data);

		window.bus.subOnce('anim complete', function(){
			stage = 'healthChange'

			soldierManager.ShowHealthChange([{
				unitId: _data.unitId,
				newHealth: _data.health
			}, {
				unitId: _data.enemyUnitId,
				newHealth: _data.enemyHealth
			}]);

			window.bus.subOnce('anim complete', function(){
				window.bus.pub('action complete');
			});
		}, 'game');

		return {
			skip: function(){
				if(stage == 'fight')
					soldierManager.SkipFight();
				if(stage == 'healthChange')
					soldierManager.SkipHealthChange([{unitId: _data.unitId}, {unitId: _data.enemyUnitId}]);
			}
		}
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
