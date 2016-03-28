App.run(function($rootScope, $location, $cookies) {
		// register listener to watch route changes
		$rootScope.$on( "$routeChangeStart", function(event, next, current) {
			new Promise(function(resolve, reject){
				if (!$rootScope.user) {
					var authCookie = $cookies.get('auth');
					
					if(authCookie){
						var authParts = authCookie.split(':');
						var userId = authParts[0];
						var token = authParts[1];
						
						$.post('/user/auth/' + userId, {token: token}).then(function(response){
							if(response.success){
								$rootScope.user = response.player;
								
								resolve();
							} else {
								reject();
							}
						}, function(){
							reject();
						});
					} else {
						reject();
					}
				}
			}).then(function(){
				// Authed, sweet
			}, function(){
				$cookies.remove('auth');
				
				$location.path('/login');
				if ( next.controller == 'LoginController' ) {
					// already going to #login, no redirect needed
				} else {
					// not going to #login, we should redirect now
					$location.path('/login');
				}
			});
		});
	})
	
	.run(function(bus){
		var socket = io();
		console.log("lel", bus);
		socket.on('message', function(msg){
			bus.pub('socket ' + msg.type, msg);
		});
		
		bus.sub('socket message', function(msg){
			console.log('outward message', msg);
		});
		
		return socket;
	});