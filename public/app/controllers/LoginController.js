App.controller('LoginController', function($scope, $rootScope, $location, $cookies){
	$scope.user = {};
	
	$('#LoginButton').click(function(){
		$.post('/user/login/' + $scope.user.id)
			.then(function(response){
				if(response.success){
					$rootScope.user = response.player;
					$cookies.put('auth', response.player.id + ":" + response.player.token);
				}else{
					$rootScope.user = $scope.user;
					$scope.info('/create');
				}
			});
	});
});