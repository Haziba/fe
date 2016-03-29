App.controller('LobbyController', function($scope, $rootScope, $location, bus){
	$scope.user = $rootScope.user;
	$scope.foundGame = false;
	
	bus.pub('socket message', {msg: true});
	
	$('#playGame').click(function(){
		bus.pub('socket message', 'lobby', {
			type: 'lookForGame'
		});
		
		$scope.status = 'Looking...';
	});
	
	bus.sub('socket foundGame', function(msg){
		$scope.status = 'Found game!';
		
		$scope.foundGame = true;
	});
	
	$scope.status = 'Not looking';
});