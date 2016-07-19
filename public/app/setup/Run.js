App.run(function(bus, $rootScope){
		var socket = io();

		var areas = ['lobby', 'game'];

		$rootScope.subbedControllers = {};

		for(var i = 0; i < areas.length; i++)
			(function(area){
				var state = {
					subbed: false,
					queued: []
				}

				$rootScope.subbedControllers[area] = false;

				socket.on(area, function(msg){
					console.log('inward message', area, msg);
					if(state.subbed)
						bus.pub('socket ' + area, msg);
					else
						state.queued.push(msg);
				});

				bus.sub(area + ' subbed', function(){
					$rootScope.subbedControllers[area] = true;
					state.subbed = true;

					for(var i = 0; i < state.queued.length; i++)
						bus.pub('socket ' + area, state.queued[i]);

					state.queued = [];
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
	})

	.run(function($rootScope, bus, $location){
			$rootScope.user = window.user;

			bus.pub('user login', window.user);

			$rootScope.$on( "$routeChangeStart", function(event, next, current) {
				if(next.controller != 'GameController' && $rootScope.user.inGame){
					$location.path('/game');
				}

				if(next.controller == 'GameController' && !$rootScope.user.inGame){
					$location.path('/lobby');
				}
			});
		})

	.run(function($rootScope){
		$rootScope.enums = {
			Soldier: Soldier,
			Team: Team,
			GameState: GameState,
			Unit: Unit,
			EquipmentSlot: EquipmentSlot,
		};

		for(var key in $rootScope.enums){
			for(var enumKey in $rootScope.enums[key]){
				$rootScope.enums[key][$rootScope.enums[key][enumKey]] = enumKey;
			}
		}

		$rootScope.items = window.items;
		$rootScope.levels = window.levels;
	});
