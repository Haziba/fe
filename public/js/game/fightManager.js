var NewFightManager = function(){
	var _me = {};

	var _stage = 0;
	var _location = {x: 0, y: 0};

	var _unitOne, _unitTwo;
	var _timerCountdown = 10;

	var _attackerOnLeft, _fightStages = [];

	window.bus.sub('fight start', function(unitOne, unitTwo, attackOrder){
		var centre1 = unitOne.GetCentralLocation();
		var centre2 = unitTwo.GetCentralLocation();

		_stage = 1;
		_location = {x: (centre1.x + centre2.x) / 2, y: (centre1.y + centre2.y) / 2};

		_attackerOnLeft = centre1.x < centre2.x;
		_fightStages = [FightStage.PAUSE];

		for(var i = 0; i < attackOrder.length; i++){
			if(unitOne.id == attackOrder[i])
				if(_attackerOnLeft)
					_fightStages.push(FightStage.UNIT_ONE_FORWARDS, FightStage.UNIT_ONE_BACKWARDS, FightStage.PAUSE);
				else
					_fightStages.push(FightStage.UNIT_TWO_FORWARDS, FightStage.UNIT_TWO_BACKWARDS, FightStage.PAUSE);

			if(unitTwo.id == attackOrder[i])
				if(_attackerOnLeft)
					_fightStages.push(FightStage.UNIT_TWO_FORWARDS, FightStage.UNIT_TWO_BACKWARDS, FightStage.PAUSE);
				else
					_fightStages.push(FightStage.UNIT_ONE_FORWARDS, FightStage.UNIT_ONE_BACKWARDS, FightStage.PAUSE);
		}

		window.bus.sub('fight skip', function(){
			_fightStages = [];

			window.bus.pub('anim complete');
		});

		_fightStages.push(FightStage.PAUSE);

		var leftSprite = _attackerOnLeft ? unitOne.SpriteType() : unitTwo.SpriteType();
		var rightSprite = _attackerOnLeft ? unitTwo.SpriteType() : unitOne.SpriteType();

		_unitOne = {location: {x: _location.x - 40, y: _location.y - 20}, shift: 0, spriteType: leftSprite};
		_unitTwo = {location: {x: _location.x + 10, y: _location.y - 20}, shift: 0, spriteType: rightSprite};
	}, 'game');

	_me.Update = function(){
		if(_fightStages.length == 0)
			return;

		switch(_fightStages[_stage]){
			case FightStage.UNIT_ONE_FORWARDS:
				_unitOne.shift+=0.6;
				if(_unitOne.shift >= 10)
					_stage++;
				break;
			case FightStage.UNIT_ONE_BACKWARDS:
				_unitOne.shift-=0.6;
				if(_unitOne.shift <= 0)
					_stage++;
				break;
			case FightStage.UNIT_TWO_FORWARDS:
				_unitTwo.shift-=0.6;
				if(_unitTwo.shift <= -10)
					_stage++;
				break;
			case FightStage.UNIT_TWO_BACKWARDS:
				_unitTwo.shift+=0.6;
				if(_unitTwo.shift >= 0)
					_stage++;
				break;
			case FightStage.PAUSE:
				_timerCountdown -= 0.6;

				if(_timerCountdown <= 0){
					_timerCountdown = 10;
					_stage++;

					if(_stage == _fightStages.length){
						_stage = 0;
						_fightStages = [];

						window.bus.pub('anim complete');
					}
				}
				break;
		}
	}

	_me.Draw = function(){
		if(_fightStages.length > 0){
			SpriteHandler.DrawBattleBackground(_location);

			SpriteHandler.Draw(_unitOne.spriteType, {x: _unitOne.location.x + _unitOne.shift, y: _unitOne.location.y});
			SpriteHandler.Draw(_unitTwo.spriteType, {x: _unitTwo.location.x + _unitTwo.shift, y: _unitTwo.location.y});
		}
	}

	return _me;
}

var FightStage = {
	PAUSE: 0,
	UNIT_ONE_FORWARDS: 1,
	UNIT_ONE_BACKWARDS: 2,
	UNIT_TWO_FORWARDS: 3,
	UNIT_TWO_BACKWARDS: 4
}
