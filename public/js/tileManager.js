var NewTileManager = function(initData){
	var _me = {id: Global.NewId()};
	
	var _tiles = [];
	
	for(var i = 0; i < Global.ScreenSize().width; i++)
	{
		_tiles[i] = [];
		for(var j = 0; j < Global.ScreenSize().height; j++)
		{
			_tiles[i][j] = NewTile(i, j, initData.map[i][j] == 1 ? Tiles.BRICK : Tiles.GRASS);
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