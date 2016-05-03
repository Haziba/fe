var NewFightManager = function(){
	var _me = {};

	var _stage = 0;
	var _location = {x: 0, y: 0};

	var _unitOne, _unitTwo;
	var _timerCountdown = 10;

	window.bus.sub('fight start', function(unitOne, unitTwo){
		var centre1 = unitOne.GetCentralLocation();
		var centre2 = unitTwo.GetCentralLocation();

		_stage = 1;
		_location = {x: (centre1.x + centre2.x) / 2, y: (centre1.y + centre2.y) / 2};

		_unitOne = {location: {x: _location.x - 40, y: _location.y - 20}, shift: 0, spriteType: unitOne.SpriteType()};
		_unitTwo = {location: {x: _location.x + 10, y: _location.y - 20}, shift: 0, spriteType: unitTwo.SpriteType()};
	}, 'game');

	_me.Update = function(){
		switch(fightStages[_stage]){
			case FightStage.UNIT_ONE_FORWARDS:
				_unitOne.shift+=0.2;
				if(_unitOne.shift >= 10)
					_stage++;
				break;
			case FightStage.UNIT_ONE_BACKWARDS:
				_unitOne.shift-=0.2;
				if(_unitOne.shift <= 0)
					_stage++;
				break;
			case FightStage.UNIT_TWO_FORWARDS:
				_unitTwo.shift-=0.2;
				if(_unitTwo.shift <= -10)
					_stage++;
				break;
			case FightStage.UNIT_TWO_BACKWARDS:
				_unitTwo.shift+=0.2;
				if(_unitTwo.shift >= 0)
					_stage++;
				break;
			case FightStage.PAUSE:
				_timerCountdown -= 0.2;

				if(_timerCountdown <= 0){
					_timerCountdown = 10;
					_stage++;

					if(_stage == fightStages.length){
						_stage = 0;

						window.bus.pub('anim complete');
					}
				}
		}
	}

	_me.Draw = function(){
		if(_stage != FightStage.NONE){
			SpriteHandler.DrawBattleBackground(_location);

			SpriteHandler.Draw(_unitOne.spriteType, {x: _unitOne.location.x + _unitOne.shift, y: _unitOne.location.y});
			SpriteHandler.Draw(_unitTwo.spriteType, {x: _unitTwo.location.x + _unitTwo.shift, y: _unitTwo.location.y});
		}
	}

	return _me;
}

var FightStage = {
	NONE: 0,
	PAUSE: 1,
	UNIT_ONE_FORWARDS: 2,
	UNIT_ONE_BACKWARDS: 3,
	UNIT_TWO_FORWARDS: 4,
	UNIT_TWO_BACKWARDS: 5,
}

var fightStages = [
	FightStage.NONE,
	FightStage.PAUSE,
	FightStage.UNIT_ONE_FORWARDS,
	FightStage.UNIT_ONE_BACKWARDS,
	FightStage.PAUSE,
	FightStage.UNIT_TWO_FORWARDS,
	FightStage.UNIT_TWO_BACKWARDS,
	FightStage.PAUSE,
]
