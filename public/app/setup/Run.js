App.run(function($rootScope, $location, $cookies, bus) {
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
								$rootScope.user = response.user;
								
								bus.pub('user login', $rootScope.user);
								
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
				if(next.controller != 'GameController' && $rootScope.user.inGame){
					$location.path('/game');
				}
				
				if(next.controller == 'GameController' && !$rootScope.user.inGame){
					$location.path('/lobby');
				}
			}, function(){
				$cookies.remove('auth');
				
				if ( next.controller != 'LoginController' ) {
					$location.path('/login');
				}
			});
		});
	})
	
	.run(function(bus){
		var socket = io();
		
		var areas = ['lobby', 'game'];
		
		for(var i = 0; i < areas.length; i++)
			(function(area){
				socket.on(area, function(msg){
					console.log('inward message', area, msg);
					bus.pub('socket ' + area, msg);
				})
			})(areas[i]);
		
		socket.on('message', function(msg){
			console.log('inward message', msg);
			
			bus.pub('socket ' + msg.type, msg);
		});
		
		bus.sub('socket message', function(area, msg){
			socket.emit(area, msg)
			console.log('outward message', msg);
		});
		
		bus.sub('user login', function(user){
			socket.emit('init', user.id);
			console.log('user init', user);
		});
		
		return socket;
	});