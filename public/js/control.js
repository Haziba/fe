var NewControl = function(){
	var _me = {id: Global.NewId()};
	
	var tileHighlight = {x: 0, y: 0};
	
	_me.Update = function(){
		tileHighlight.x = Math.floor(InputHandler.MousePosition().x / Global.TileSize());
		tileHighlight.y = Math.floor(InputHandler.MousePosition().y / Global.TileSize());
		
		if(InputHandler.MouseClicked())
			window.bus.pub('cursor click', tileHighlight);
	}
	
	_me.Draw = function(){
		SpriteHandler.Draw(Sprite.CURSOR, {x: tileHighlight.x * Global.TileSize(), y: tileHighlight.y * Global.TileSize()});
	}
	
	return _me;
}