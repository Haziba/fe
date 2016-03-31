App.config(['$routeProvider',
	function($routeProvider){
		/*
		var loginController = local ? 'LoginController' : 'FbLoginController';
		*/
		
		$routeProvider.when('/login', {
			templateUrl: './app/templates/login.html',
			controller: 'LoginController' // loginController
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