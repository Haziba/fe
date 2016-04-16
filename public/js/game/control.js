var NewControl = function(initData){
	var _me = {id: Global.NewId()};

	var _active = false;

	var _gameRunning = initData.state == GameState.PLAYING;

	var _tileHighlight = {x: 0, y: 0};

	window.bus.sub('game end', function(){
		_gameRunning = false;
	});

	window.bus.sub('game start', function(){
		_gameRunning = true;
	})

	_me.Update = function(){
		if(!_gameRunning)
			return;

		if(!InputHandler.MouseOver())
			_active = false;

		_tileHighlight.x = Math.floor(InputHandler.MousePosition().x / Global.TileSize());
		_tileHighlight.y = Math.floor(InputHandler.MousePosition().y / Global.TileSize());

		if(_tileHighlight.x >= 0 && _tileHighlight.x < Global.ScreenSize().width && _tileHighlight.y >= 0 && _tileHighlight.y < Global.ScreenSize().height){
			_active = true;
			if(InputHandler.MouseClicked())
				window.bus.pub('cursor click', _tileHighlight);
		}
		else
			_active = false;
	}

	_me.Draw = function(){
		if(!_gameRunning)
			return;

		if(!_active)
			return;

		SpriteHandler.Draw(Sprite.CURSOR, {x: _tileHighlight.x * Global.TileSize(), y: _tileHighlight.y * Global.TileSize()});
	}

	return _me;
}
