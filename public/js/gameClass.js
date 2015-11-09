var StartGame = function()
{
	var _stageManager = NewStageManager();
	
	var _tileManager = NewTileManager();
	var _soldierManager = NewSoldierManager();
	
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