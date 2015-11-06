var StartGame = function()
{
	var _stageManager = NewStageManager();
	
	var _tileManager = NewTileManager();
	var _soldierManager = NewSoldierManager();
	
	var _control = NewControl();
	
	setInterval(function(){
		_tileManager.Update();
		_soldierManager.Update();
		_control.Update();
	}, 1 / 30);
	
	var Draw = function(){
		SpriteHandler.Clear();
		
		_tileManager.Draw();
		_soldierManager.Draw();
		_control.Draw();
		
		window.requestAnimationFrame(Draw);
	}
	
	window.requestAnimationFrame(Draw);
}
