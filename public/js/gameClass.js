var StartGame = function($controls, initData)
{
	var _stageManager = NewStageManager(initData);
	
	var _teamNum = initData.players[socketId].team;
	
	var _tileManager = NewTileManager(initData);
	// todo: Just pass through initData
	var _soldierManager = NewSoldierManager(initData.units, _teamNum, initData.activeTeam);
	var _shipManager = NewShipManager(initData, _teamNum);
	
	var _control = NewControl(initData);
	var _hud = NewHUD($controls, initData);
	
	NewActionQueue(_soldierManager, _stageManager, _hud);
	
	// update mutex
	var _updateRunning = false;
	
	window.bus.sub('game reset resolve', function(data){
		_stageManager = NewStageManager(data);
		
		_tileManager = NewTileManager(data);
		_soldierManager = NewSoldierManager(data.units, data.players[socketId].team);
		_shipManager = NewShipManager(data, _teamNum);

		_control = NewControl(data);
		_hud = NewHUD(data);
	});
	
	setInterval(function(){
		if(_updateRunning)
			return;
			
		_updateRunning = true;
		
		_tileManager.Update();
		_soldierManager.Update();
		_shipManager.Update();
		
		_control.Update();
		_hud.Update();
		
		InputHandler.Update();
		
		_updateRunning = false;
	}, 1 / 30);
	
	var Draw = function(){
		SpriteHandler.Clear();
		
		_tileManager.Draw();
		_shipManager.Draw();
		_soldierManager.Draw();
		_stageManager.Draw();
		_control.Draw();
		_hud.Draw();
		
		window.requestAnimationFrame(Draw);
	}
	
	window.requestAnimationFrame(Draw);
}