var NewControl = function(initData){
	var _me = {id: Global.NewId()};

	var _active = false;

	var _gameRunning = initData.state == GameState.PLAYING;
	var _actionRunning = false;

	var _tileHighlight = {x: 0, y: 0};

	window.bus.sub('game end', function(){
		_gameRunning = false;
	}, 'game');

	window.bus.sub('game start', function(){
		_gameRunning = true;
	}, 'game');

	window.bus.sub('action start', function(){
		_actionRunning = true;
	});

	window.bus.sub('action complete', function(){
		_actionRunning = false;
	});

	_me.Update = function(){
		if(!_gameRunning)
			return;

		if(_actionRunning){
			if(InputHandler.MouseClicked())
				window.bus.pub('action skip');
		} else {
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
	}

	_me.Draw = function(){
		if(!_gameRunning)
			return;

		if(!_active)
			return;

		if(_actionRunning)
			return;

		SpriteHandler.Draw(Sprite.CURSOR, {x: _tileHighlight.x * Global.TileSize(), y: _tileHighlight.y * Global.TileSize()});
	}

	return _me;
}
