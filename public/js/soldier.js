var NewSoldier = function(x, y, soldierType, team)
{
	var _me = {};
	
	var GetSprite = function(){
		switch(soldierType)
		{
			case Soldier.SWORD:
				return Sprite.SWORD;
			case Soldier.AXE:
				return Sprite.AXE;
			case Soldier.SPEAR:
				return Sprite.SPEAR;
		}
	}
	
	_me.GetPosition = function(){
		return {x: x, y: y};
	}
	
	_me.Draw = function(){
		SpriteHandler.Draw(GetSprite(), {x: x * 20, y: y * 20});
		
		SpriteHandler.Draw(team == Team.ENEMY ? Sprite.YOUR_UNIT : Sprite.THEIR_UNIT, {x: x * 20, y: y * 20});
	}
	
	window.bus.pub('soldier place', _me);
	
	return _me;
}

var Soldier = {
	SWORD: 0,
	AXE: 1,
	SPEAR: 2
}

var Team = {
	ME: 0,
	ENEMY: 1
}