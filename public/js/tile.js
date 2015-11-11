var NewTile = function(x, y, tileType) {
	var _me = {id: Global.NewId()};
	
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
		SpriteHandler.Draw(GetSprite(), {x: x * Global.TileSize(), y: y * Global.TileSize()});
	}
	
	return _me;
}

var Tiles = {
	BRICK: 0,
	GRASS: 1
}