var NewTileManager = function(){
	var _me = {id: makeid()};
	
	var _tiles = [];
	
	for(var i = 0; i < 35; i++)
	{
		_tiles[i] = [];
		for(var j = 0; j < 25; j++)
		{
			_tiles[i][j] = NewTile(i, j, i == 0 || i == 34 || j == 0 || j == 24 ? Tiles.BRICK : Tiles.GRASS);
		}
	}
	
	_me.Update = function(){
		
	}
	
	_me.Draw = function(){
		for(var i = 0; i < _tiles.length; i++)
			for(var j = 0; j < _tiles[i].length; j++)
				_tiles[i][j].Draw();
	}
	
	return _me;
}