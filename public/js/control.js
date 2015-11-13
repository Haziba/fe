var NewControl = function(initData){
	var _me = {id: Global.NewId()};
	
	var _gameRunning = initData.state == 0;
	
	var _tileHighlight = {x: 0, y: 0};
	
	window.bus.sub('game end', function(){
		_gameRunning = false;
	});
	
	_me.Update = function(){
		if(!_gameRunning)
			return;
	
		_tileHighlight.x = Math.floor(InputHandler.MousePosition().x / Global.TileSize());
		_tileHighlight.y = Math.floor(InputHandler.MousePosition().y / Global.TileSize());
		
		_tileHighlight.x = Math.max(Math.min(_tileHighlight.x, Global.ScreenSize().width-1), 0);
		_tileHighlight.y = Math.max(Math.min(_tileHighlight.y, Global.ScreenSize().height-1), 0);
		
		if(InputHandler.MouseClicked())
			window.bus.pub('cursor click', _tileHighlight);
	}
	
	_me.Draw = function(){
		if(!_gameRunning)
			return;
			
		SpriteHandler.Draw(Sprite.CURSOR, {x: _tileHighlight.x * Global.TileSize(), y: _tileHighlight.y * Global.TileSize()});
	}
	
	return _me;
}