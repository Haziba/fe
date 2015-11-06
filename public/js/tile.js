var NewTile = function(x, y, tileType) {
	var _me = {id: makeid()};
	
	var GetSprite = function(){
		switch(tileType)
		{
			case Tiles.BRICK:
				return Sprite.BRICK;
			case Tiles.GRASS:
				return Sprite.GRASS;
		}
	}
	
	_me.Draw = function(){
		SpriteHandler.Draw(GetSprite(), {x: x * 20, y: y * 20});
	}
	
	return _me;
}

var Tiles = {
	BRICK: 0,
	GRASS: 1
}