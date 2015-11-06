var NewControl = function(){
	var _me = {};
	
	var tileHighlight = {x: 0, y: 0};
	
	_me.Update = function(){
		tileHighlight.x = Math.floor(InputHandler.MousePosition().x / 20);
		tileHighlight.y = Math.floor(InputHandler.MousePosition().y / 20);
		
		if(InputHandler.MouseClicked())
			window.bus.pub('cursor click', tileHighlight);
	}
	
	_me.Draw = function(){
		SpriteHandler.Draw(Sprite.CURSOR, {x: tileHighlight.x * 20, y: tileHighlight.y * 20});
	}
	
	return _me;
}