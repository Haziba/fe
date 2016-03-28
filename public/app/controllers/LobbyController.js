App.controller('LobbyController', function($scope, $rootScope, $location, bus){
	$scope.user = $rootScope.user;
	
	bus.pub('socket message', {msg: true});
});