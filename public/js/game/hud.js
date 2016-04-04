var NewHUD = function($controls, initData){
	var _me = {};
	
	var _team, _activeTeam, _gameState;
	
	var _enemyUser = undefined;
	
	var _selectedUnit;
	
	var $turnTimer = $controls.find('#turnTimer');
	
	var $unitDone = $controls.find('#unitDone');
	var $endTurn = $controls.find('#endTurn');
	var $currentTurn = $controls.find('#currentTurn');
	var $enemyName = $controls.find('#enemyName');
	var $enemyOnline = $controls.find('#enemyOnline');
	
	var $unitSelection = $controls.find('#unitSelection');
	var $unitName = $controls.find('#unitName');
	var $unitHealth = $controls.find('#unitHealth');
	var $unitStrength = $controls.find('#unitStrength');
	var $unitArmour = $controls.find('#unitArmour');
	
	var _nextTurn = initData.lastTurnStart + initData.turnTime * 1000;
	
	var _turnEndPopupTimer = 0;
	
	for(var userId in initData.users)
		if(userId != Global.user.id){
			_enemyUser = initData.users[userId];
		}
	
	$enemyName.text(_enemyUser.name);
	$enemyOnline.text(_enemyUser.connected ? "Online" : "Offline");
	
	var init = function(game){
		_team = game.users[Global.user.id].team;
		_activeTeam = game.activeTeam;
		
		_gameState = game.state;
		
		window.bus.pub('game start');
		
		UpdateCurrentTurn(_activeTeam);
	}
	
	var UpdateCurrentTurn = function(team){
		$currentTurn.text(team == _team ? Global.user.name : _enemyUser.name);
		
		window.document.title = 'FE | ' + (team == _team ? 'Your' : 'Enemy') + ' Turn';
		
		$endTurn.attr('disabled', team != _team);
	}
	
	init(initData);
	
	$unitDone.click(function(){
		_selectedUnit.Done();
		
		window.bus.pub('action new', {action: 'soldier done', data: _selectedUnit.id});
		
		_selectedUnit.Deselect();
	});
	
	$unitDone.attr("disabled", true);
	
	$endTurn.click(function(){
		window.bus.pub('action new', {action: 'turn end'});
	
		$endTurn.attr('disabled', true);
	});
	
	if(_team != initData.activeTeam)
		$endTurn.attr("disabled", true);
	
	UpdateCurrentTurn(initData.activeTeam);
	
	_me.StateChange = function(gameState){
		_gameState = gameState;
		
		if(_gameState != 0)
			window.bus.pub('game end');
	};
	
	_me.TurnEnd = function(activeTeam){
		UpdateCurrentTurn(activeTeam);
		
		_nextTurn = (new Date()).getTime() + initData.turnTime * 1000;
		
		_turnEndPopupTimer = 120;
		
		if(_team == activeTeam)
			$endTurn.removeAttr('disabled');
	}
	
	_me.ResetGame = function(game){
		init(game);
	}
	
	window.bus.sub('enemy connection resolve', function(connected){
		$enemyOnline.text(connected ? "Online" : "Offline");
	});
	
	window.bus.sub('select', function(unit){
		_selectedUnit = unit;
		
		$unitSelection.show();
		
		var stats = unit.Stats();
		
		$unitName.text(unit.id);
		$unitHealth.text(stats.health + "/" + stats.maxHealth);
		$unitStrength.text(stats.strength);
		$unitArmour.text(stats.armour);
		
		if(unit.Team() == _team && _activeTeam == _team)
			$unitDone.removeAttr('disabled');
	});
	
	window.bus.sub('deselect', function(){
		_selectedUnit = undefined;
		
		$unitSelection.hide();
		
		$unitDone.attr('disabled', true);
	});
	
	_me.Update = function(){
		if(_gameState != 0){
			if(InputHandler.MouseClicked())
				window.bus.pub('action new', {action: 'game reset'});
		}
		
		$turnTimer.text(Math.floor((_nextTurn - (new Date()).getTime()) / 1000) + 1);
		
		if(_turnEndPopupTimer > 0)
			_turnEndPopupTimer--;
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
		
		if(_selectedUnit){
			var stats = _selectedUnit.Stats();
			
			context.fillText("Name: " + _selectedUnit.id, 310, 625);
			context.fillText("Health: " + stats.health + "/" + stats.maxHealth, 310, 655);
			context.fillText("Strength: " + stats.strength, 310, 685);
			context.fillText("Armour: " + stats.armour, 310, 715);
		}
		
		if(_turnEndPopupTimer > 0){
			context.globalAlpha = Math.min(1, _turnEndPopupTimer / 30);
			
			context.fillStyle = 'white';
			context.fillRect(Global.canvasSize.width / 2 - 100, Global.canvasSize.height / 2 - 50, 200, 100);
			context.lineWidth = 3;
			context.strokeStyle = 'black';
			context.stroke();
			
			context.fillStyle = 'black';
			context.font = '30px Arial black';
			context.textAlign = 'center';
			context.fillText(_activeTeam == _team ? 'Your turn' : 'Enemy turn', Global.canvasSize.width / 2, Global.canvasSize.height / 2);
			
			context.globalAlpha = 1;
		}
	}
	
	return _me;
}