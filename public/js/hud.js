var NewHUD = function(initData){
	var _me = {};
	
	var _team = initData.players[socketId].team
	var _gameState = initData.state;
	
	var _endTurnButton = NewButton("End Turn", {x: 20, y: 20}, function(){
		window.bus.pub('turn end start');
	})
	
	window.bus.sub('game state change', function(gameState){
		_gameState = gameState;
		
		if(_gameState != 0)
			window.bus.pub('game end');
	});
	
	_me.Update = function(){
		if(_gameState != 0){
			if(InputHandler.MouseClicked())
				window.bus.pub('game reset start');
		} else {
			_endTurnButton.Update();
		}
	}
	
	_me.Draw = function(){
		if(_gameState != 0){
			var context = SpriteHandler.GetContext();
			
			context.fillStyle = 'white';
			context.fillRect(200, 200, 400, 200);
			context.lineWidth = 3;
			context.strokeStyle = 'black';
			context.stroke();
			
			context.fillStyle = 'black';
			context.font = '30px Arial black';
			context.textAlign = 'center';
			if((_gameState == 1 && _team == 0) || (_gameState == 2 && _team == 0))
				context.fillText('You win!', 400, 270);
			if((_gameState == 1 && _team == 1) || (_gameState == 2 && _team == 1))
				context.fillText('You lose!', 400, 270);
			if(_gameState == 3)
				context.fillText('Draw!', 400, 270);
			context.font = '14px Arial black';
			context.fillText('Click anywhere to restart the game', 400, 320);
		}
			_endTurnButton.Draw();
	}
	
	return _me;
}