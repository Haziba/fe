App.controller('GameController', function($scope, $rootScope, $location, bus){
	//todo: Fix bug where running through this twice sends all actions twice

	Global.canvas = $("#gameCanvas")[0];
	var context = Global.canvas.getContext("2d");

	//todo: Remove this hack, just to get the bus working across the game
	window.bus = bus;

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
			StartGame($("#gameControls"), initData, $rootScope.user);
	});

	if($rootScope.subbedControllers['game'])
		bus.clearGroup('gameCont');

	bus.sub('game init', function(data){
		$lobbyWrapper.hide();
		$gameWrapper.show();

		initData = data;

		if(spritesInitialised)
			StartGame($("#gameControls"), initData, $rootScope.user);
	}, 'gameCont');

	bus.sub('socket game', function(msg){
		switch(msg.type){
			case 'gameStarted':
				initData = msg.data;

				if(spritesInitialised)
					StartGame($("#gameControls"), initData, $rootScope.user);
				break;
			case 'action':
				console.log('action', msg);
				bus.pub('action queue', msg.data);
				break;
			case 'connection change':
				bus.pub('connection change', msg.data);
				break;
		}
	}, 'gameCont');

	bus.pub('game subbed');

	bus.sub('action new', function(action){
		bus.pub('socket message', 'game', {
			type: action.action,
			data: action.data
		});
	}, 'gameCont');

	bus.sub('game close', function(){
		console.log('game close finish');
		$rootScope.user.inGame = false;

		$rootScope.$apply(function(){
			console.log('navigate to lobby');
			$location.path('/lobby');
		});
	}, 'gameCont');
});
