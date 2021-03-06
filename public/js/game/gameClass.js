var StartGame = function($controls, initData, user)
{
	Global.user = user;

	var _gameRunning = true;

	var _stageManager = NewStageManager(initData);

	var _teamNum = initData.users[Global.user.id].team;

	var _tileManager = NewTileManager(initData);
	// todo: Just pass through initData
	var _soldierManager = NewSoldierManager(initData.units, _teamNum, initData.activeTeam);
	var _shipManager = NewShipManager(initData, _teamNum);

	var _fightManager = NewFightManager();

	var _control = NewControl(initData);
	var _hud = NewHUD($controls, initData);

	NewActionQueue(_soldierManager, _stageManager, _hud);

	// update mutex
	var _updateRunning = false;

	window.bus.sub('game reset resolve', function(data){
		_stageManager = NewStageManager(data);

		_tileManager = NewTileManager(data);
		_soldierManager = NewSoldierManager(data.units, data.users[Global.users.id].team);
		_shipManager = NewShipManager(data, _teamNum);

		_control = NewControl(data);
		_hud = NewHUD(data);
	}, 'game');

	window.bus.sub('game close', function(){
		clearInterval(gameLoop);

		_gameRunning = false;
	}, 'game');

	var gameLoop = setInterval(function(){
		if(!_gameRunning || _updateRunning)
			return;

		InputHandler.StartUpdate();

		_updateRunning = true;

		_tileManager.Update();
		_soldierManager.Update();
		_shipManager.Update();
		_fightManager.Update();

		_control.Update();
		_hud.Update();

		InputHandler.EndUpdate();

		_updateRunning = false;
	}, 1000 / 60);

	var Draw = function(){
		if(!_gameRunning)
			return;

		SpriteHandler.Clear();

		_tileManager.Draw();
		_shipManager.Draw();
		_soldierManager.Draw();
		_stageManager.Draw();
		_control.Draw();
		_fightManager.Draw();
		_hud.Draw();

		window.requestAnimationFrame(Draw);
	}

	window.requestAnimationFrame(Draw);
}
