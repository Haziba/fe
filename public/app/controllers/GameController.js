App.controller('GameController', function($scope, $rootScope, bus){
	bus.sub('socket game', function(msg){
		console.log('game', msg);
	});
});