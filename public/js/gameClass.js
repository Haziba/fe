var StartGame = function(initData)
{
	var _stageManager = NewStageManager(initData);
	
	var _tileManager = NewTileManager(initData);
	var _soldierManager = NewSoldierManager(initData.units, initData.players[socketId].team);
	
	var _control = NewControl();
	
	var updateRunning = false;
	
	setInterval(function(){
		if(updateRunning)
			return;
			
		updateRunning = true;
		
		_tileManager.Update();
		_soldierManager.Update();
		_control.Update();
		
		InputHandler.Update();
		
		updateRunning = false;
	}, 1 / 30);
	
	var Draw = function(){
		SpriteHandler.Clear();
		
		_tileManager.Draw();
		_soldierManager.Draw();
		_control.Draw();
		_stageManager.Draw();
		
		window.requestAnimationFrame(Draw);
	}
	
	window.requestAnimationFrame(Draw);
}