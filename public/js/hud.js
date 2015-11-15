var NewHUD = function(initData){
	var _me = {};
	
	var _team = initData.players[socketId].team;
	var _activeTeam = initData.activeTeam;
	var _enemyPlayerId = "";
	var _enemyConnected;
	
	var _selectedUnit;
	
	for(var player in initData.players)
		if(player != socketId){
			_enemyPlayerId = player;
			_enemyConnected = initData.players[player].connected;
		}
	
	var _gameState = initData.state;
	
	var _unitDoneButton = NewButton("Unit Done", {x: 675, y: 615}, function(){
		_selectedUnit.Done();
		
		window.bus.pub('soldier done start', _selectedUnit);
		
		_selectedUnit.Deselect();
	});
	
	_unitDoneButton.Disable();
	
	var _endTurnButton = NewButton("End Turn", {x: 675, y: 670}, function(){
		window.bus.pub('turn end start');
	});
	
	if(_team != initData.activeTeam)
		_endTurnButton.Disable();
	
	window.bus.sub('state change resolve', function(gameState){
		_gameState = gameState;
		
		if(_gameState != 0)
			window.bus.pub('game end');
	});
	
	window.bus.sub('turn end resolve', function(activeTeam){
		_activeTeam = activeTeam;
		if(_team == activeTeam)
			_endTurnButton.Enable();
		else
			_endTurnButton.Disable();
	});
	
	window.bus.sub('enemy connection', function(connected){
		_enemyConnected = connected;
	});
	
	window.bus.sub('select', function(unit){
		_selectedUnit = unit;
		
		_unitDoneButton.Enable();
	});
	
	window.bus.sub('deselect', function(){
		_selectedUnit = undefined;
		
		_unitDoneButton.Disable();
	});
	
	_me.Update = function(){
		if(_gameState != 0){
			if(InputHandler.MouseClicked())
				window.bus.pub('game reset start');
		} else {
			_endTurnButton.Update();
			_unitDoneButton.Update();
		}
	}
	
	_me.Draw = function(){
		var context = SpriteHandler.GetContext();
		
		if(_gameState != 0){
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
		
		context.fillStyle = 'black';
		context.font = '22px Arial black';
		context.textAlign = 'left';
		context.fillText("Current turn: " + (_activeTeam == _team ? socketId : _enemyPlayerId), 10, 625);
		context.fillText(_enemyPlayerId + ": " + (_enemyConnected ? "Online" : "Offline"), 10, 655);
		
		if(_selectedUnit){
			var stats = _selectedUnit.Stats();
			
			context.fillText("Name: " + _selectedUnit.id, 310, 625);
			context.fillText("Health: " + stats.health + "/" + stats.maxHealth, 310, 655);
			context.fillText("Strength: " + stats.strength, 310, 685);
			context.fillText("Armour: " + stats.armour, 310, 715);
		}
		
		_unitDoneButton.Draw();
		_endTurnButton.Draw();
	}
	
	return _me;
}