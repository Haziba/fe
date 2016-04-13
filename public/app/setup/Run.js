App.run(function($rootScope){
		$rootScope.user = window.user;

		$rootScope.$on( "$routeChangeStart", function(event, next, current) {
			if(next.controller != 'GameController' && $rootScope.user.inGame){
				$location.path('/game');
			}

			if(next.controller == 'GameController' && !$rootScope.user.inGame){
				$location.path('/lobby');
			}
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
