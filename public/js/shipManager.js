var NewShipManager = function(initData, teamNum){
	var _me = {};
	
	var _ships = [];
	
	for(var i = 0; i < initData.ships.length; i++)
		_ships.push(NewShip(initData.ships[i]));
	
	_me.Update = function(){
		
	}
	
	_me.Draw = function(){
		for(var i = 0; i < _ships.length; i++){
			var pos = _ships[i].GetPosition();
			
			SpriteHandler.Draw(Sprite.SHIP, {x: pos.x * Global.TileSize(), y: pos.y * Global.TileSize()});
			
			SpriteHandler.Draw(_ships[i].GetTeam() == teamNum ? Sprite.YOUR_UNIT : Sprite.THEIR_UNIT, {x: pos.x * Global.TileSize(), y: pos.y * Global.TileSize()});
		}
	}
	
	return _me;
}