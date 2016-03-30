App.controller('LoginController', function($scope, $rootScope, $location, $cookies, bus){
	$scope.user = {};
	
	$('#LoginButton').click(function(){
		$.post('/user/login/' + $scope.user.id)
			.then(function(response){
				console.log($scope.user.id);
				bus.pub('user login', $scope.user);
				
				if(response.success){
					$rootScope.user = response.player;
					$cookies.put('auth', response.player.id + ":" + response.player.token);
					
					$rootScope.$apply(function(){
						$location.path('/lobby');
					});
				}else{
					$rootScope.user = $scope.user;
					
					$rootScope.$apply(function(){
						$location.path('/create');
					});
				}
			});
	});
});