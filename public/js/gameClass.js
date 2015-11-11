var StartGame = function(initData)
{
	var _stageManager = NewStageManager(initData);
	
	var _tileManager = NewTileManager(initData);
	// todo: Just pass through initData
	var _soldierManager = NewSoldierManager(initData.units, initData.players[socketId].team);
	
	var _control = NewControl(initData);
	var _hud = NewHUD(initData);
	
	var updateRunning = false;
	
	setInterval(function(){
		if(updateRunning)
			return;
			
		updateRunning = true;
		
		_tileManager.Update();
		_soldierManager.Update();
		
		_control.Update();
		_hud.Update();
		
		InputHandler.Update();
		
		updateRunning = false;
	}, 1 / 30);
	
	var Draw = function(){
		SpriteHandler.Clear();
		
		_tileManager.Draw();
		_soldierManager.Draw();
		_stageManager.Draw();
		_control.Draw();
		_hud.Draw();
		
		window.requestAnimationFrame(Draw);
	}
	
	window.requestAnimationFrame(Draw);
}