var NewButton = function(text, location, action){
	var _me = {};
	
	var enabled = true;
	
	_me.Disable = function(){
		enabled = false;
	}
	
	_me.Enable = function(){
		enabled = true;
	}
	
	_me.Update = function()
	{
		if(!enabled)
			return;
		
		if(InputHandler.MouseClicked())
		{
			if(Collisions.PointInRectangle(InputHandler.MousePosition(), location.x, location.y, ButtonOptions.img.width, ButtonOptions.img.height))
			{
				action();
			}
		}
	}
	
	_me.Draw = function()
	{
		if(!enabled)
            return;
		
		var context = SpriteHandler.GetContext();
		
		context.drawImage(ButtonOptions.img, location.x, location.y);

		context.fillStyle = 'black';
		context.font = '16px Arial black';
		context.textAlign = 'center';
		context.fillText(text, location.x + ButtonOptions.img.width / 2, location.y + ButtonOptions.img.height / 2 + 5);
		
	}
	
	return _me;
}

var ButtonOptions = {
	img: new Image(),
	loaded: false
};

ButtonOptions.img.onload = function(){
	ButtonOptions.loaded = true;
}

ButtonOptions.img.src = "/img/ButtonBackgrounds.png";