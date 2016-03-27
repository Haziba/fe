App.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/login', {
			templateUrl: './app/templates/login.html',
			controller: 'LoginController'
		}).when('/create', {
			templateUrl: './app/templates/create.html',
			controller: 'CreateController'
		}).when('/lobby', {
			templateUrl: './app/templates/lobby.html',
			controller: 'LobbyController'
		}).otherwise({
			redirectTo: '/login'
		});
	}]);