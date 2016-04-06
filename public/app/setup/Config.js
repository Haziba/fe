App.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/login', {
			templateUrl: './app/templates/login.html',
			controller: 'LoginController',
			resolve: {
				data: function(debugState, $rootScope, $location){
					if(!debugState.local)
						$location.path('/fblogin');
				}
			}
		}).when('/fblogin', {
			templateUrl: './app/templates/fblogin.html',
			controller: 'FbLoginController'
		}).when('/create', {
			templateUrl: './app/templates/create.html',
			controller: 'CreateController'
		}).when('/lobby', {
			templateUrl: './app/templates/lobby.html',
			controller: 'LobbyController'
		}).when('/game', {
			templateUrl: './app/templates/game.html',
			controller: 'GameController'
		}).otherwise({
			redirectTo: '/login'
		});
	}]);