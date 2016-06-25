App.controller('LobbyController', function($scope, $rootScope, $location, bus){
	$scope.user = $rootScope.user;
	$scope.lookingForGame = false;
	$scope.foundGame = false;
	$scope.queueTimer = "-- seconds in queue";

	queueTimer = 0;

	var setQueueTime = function(time){
		if(time < 0){
			$scope.queueTimer = "-- seconds in queue";
			clearInterval(queueTimer);
		} else {
			$scope.queueTimer = time + " seconds in queue";

			queueTimer = setTimeout(function(){
				setQueueTime(time + 1);
			}, 1000);
		}

		$scope.$apply();
	}

	$('#joinQueue').click(function(){
		$scope.lookingForGame = true;

		bus.pub('socket message', 'lobby', {
			type: 'lookForGame'
		});

		setQueueTime(0);
	});

	$('#acceptGame').click(function(){
		bus.pub('socket message', 'lobby', {
			type: 'acceptGame'
		});

		setQueueTime(-1);
	});

	$('#rejectGame').click(function(){
		bus.pub('socket message', 'lobby', {
			type: 'rejectGame'
		});

		setQueueTime(-1);
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

			case 'error':
				console.log('An error has occurred. This may be caused by attempting to join a game before the page has fully loaded. Apologies for any inconvenience this may have caused');

				$scope.lookingForGame = false;
				$scope.foundGame = false;
				setQueueTime(-1);

				$scope.$apply();
				break;
		}
	}, 'lobbyCont');

	bus.pub('lobby subbed');
});
