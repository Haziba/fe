App.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/create', {
			templateUrl: './app/templates/create.html',
			controller: 'CreateController'
		}).when('/lobby', {
			templateUrl: './app/templates/lobby.html',
			controller: 'LobbyController',
			resolve: {
				data: function($rootScope){
					if($rootScope.user.inGame)
						$location.path('/game');
				}
			}
		}).when('/game', {
			templateUrl: './app/templates/game.html',
			controller: 'GameController',
			resolve: {
				data: function($rootScope){
					if(!$rootScope.user.inGame)
						$location.path('/lobby');
				}
			}
		}).otherwise({
			redirectTo: '/lobby'
		});
	}]);
