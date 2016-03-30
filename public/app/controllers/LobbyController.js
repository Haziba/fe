App.controller('LobbyController', function($scope, $rootScope, $location, bus){
	$scope.user = $rootScope.user;
	$scope.foundGame = false;
	
	$('#playGame').click(function(){
		bus.pub('socket message', 'lobby', {
			type: 'lookForGame'
		});
		
		$scope.status = 'Looking...';
		$scope.$apply();
	});
	
	$('#acceptGame').click(function(){
		bus.pub('socket message', 'lobby', {
			type: 'acceptGame'
		});
	});
	
	$('#rejectGame').click(function(){
		bus.pub('socket message', 'lobby', {
			type: 'rejectGame'
		});
	});
	
	bus.sub('socket lobby', function(msg){
		console.log(msg);
		switch(msg.type){
			case 'foundGame':
				$scope.status = 'Found game!';
				
				$scope.foundGame = true;
				$scope.$apply();
				break;
			case 'pendingGameCancelled':
				$scope.status = 'Pending game cancelled';
				
				$scope.foundGame = false;
				$scope.$apply();
				break;
			case 'gameAccepted':
				$scope.status = 'Game accepted! Starting!';
				
				$scope.foundGame = false;
				$scope.$apply();
				break;
		}
	});
	
	$scope.status = 'Not looking';
});