App.controller('LobbyController', function($scope, $rootScope, $location, bus){
	$scope.user = $rootScope.user;
	
	bus.pub('socket message', {msg: true});
	
	$('#playGame').click(function(){
		bus.pub('socket message', 'lobby', {type: 'lookForGame'});
	});
	
	bus.sub('socket foundGame', function(msg){
		console.log('found game', msg);
	});
	
	$scope.status = 'Not looking';
});