App.controller('GameController', function($scope, $rootScope, bus){
	Global.canvas = $("#gameCanvas")[0];
	var context = Global.canvas.getContext("2d");
	
	var spritesInitialised, initData;
	
	var sprite = new Image();
	sprite.src = "img/spritesheet.png";
	
	var battleBackground = new Image();
	battleBackground.src = "img/FightBackground.png";
	
	var $gameWrapper = $("#gameWrapper");
	
	Promise.all([sprite, battleBackground]).then(function(){
		InputHandler.Initialise(Global.canvas);
		SpriteHandler.Initialise(context, sprite, battleBackground);
		
		spritesInitialised = true;
		
		if(initData)
			StartGame($("#gameControls"), initData);
	});
	
	window.bus.sub('game init', function(data){
		$lobbyWrapper.hide();
		$gameWrapper.show();
	
		initData = data;
		
		if(spritesInitialised)
			StartGame($("#gameControls"), initData, $rootScope.user);
	});
	
	bus.sub('socket game', function(msg){
		console.log('game', msg);
		
		switch(msg.type){
			case 'gameStarted':
				initData = msg.data;
				
				if(spritesInitialised)
					StartGame($("#gameControls"), initData, $rootScope.user);
			break;
		}
	});
});