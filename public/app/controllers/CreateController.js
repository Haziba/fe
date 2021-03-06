App.controller('CreateController', function($scope, $rootScope, $cookies, $location){
	$scope.user = $rootScope.user;
	
	$('#CreateButton').click(function(){
		$.post('/user/register/' + $scope.user.id, $scope.user)
			.then(function(response){
				if(response.success){
					$rootScope.user = response.user;
					$cookies.put('auth', response.user.id + ":" + response.user.token);
					
					$rootScope.$apply(function(){
						$location.path('/lobby');
					});
				} else {
					// idk handle this later. This should only be hit on the local machine anyway so we might not even need error handling
				}
			});
	});
});