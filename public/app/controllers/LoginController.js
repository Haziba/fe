App.controller('LoginController', function($scope, $rootScope){
	$scope.user = {};
	
	$('#LoginButton').click(function(){
		$.post('/user/login/' + $scope.user.id)
			.then(function(response){
				if(response.exists){
					$rootScope.user = response.player;
				}else{
					$rootScope.user = $scope.user;
					// move to Create
				}
			});
	});
});