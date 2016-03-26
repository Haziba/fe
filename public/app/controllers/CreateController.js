App.controller('CreateController', function($scope, $rootScope){
	$scope.user = $rootScope.user || {};
	
	$scope.user.id = 'test2';
	
	$('#CreateButton').click(function(){
		$.post('/user/register/' + $scope.user.id, $scope.user)
			.then(function(response){
				if(response.success){
					$rootScope.user = response.player;
					// Redirect to lobby
				} else {
					// idk handle this later. This should only be hit on the local machine anyway so we might not even need error handling
				}
			});
	});
});