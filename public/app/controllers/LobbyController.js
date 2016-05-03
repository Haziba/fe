App.controller('LobbyController', function($scope, $rootScope, $location, bus){
	$scope.user = $rootScope.user;
	$scope.lookingForGame = false;
	$scope.foundGame = false;

	$('#joinQueue').click(function(){
		$scope.lookingForGame = true;

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

	if($rootScope.subbedControllers['lobby'])
		bus.clearGroup('lobbyCont');

	bus.sub('socket lobby', function(msg){
		console.log('lobby', msg);

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
				$rootScope.user.inGame = true;

				$rootScope.$apply(function(){
					$location.path('/game');
				});
				break;
		}
	}, 'lobbyCont');

	bus.pub('lobby subbed');


	$scope.status = 'Not looking';
});
