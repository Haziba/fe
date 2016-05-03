App.service('bus', function(){
		var _me = {
			eventHandlers: {},
			onceEventHandlers: {},

			queue: [],

			subOnce: function(event, handler, group){
				this.queue.push({
					type: 'subOnce',
					event: event,
					handler: handler,
					group: group
				});

				if(!_queueRunning)
					runQueue();
			},

			sub: function(event, handler, group)
			{
				this.queue.push({
					type: 'sub',
					event: event,
					handler: handler,
					group: group
				});

				if(!_queueRunning)
					runQueue();
			},

			pub: function(event)
			{
				this.queue.push({
					type: 'pub',
					event: event,
					data: [].splice.call(arguments, 1)
				});

				if(!_queueRunning)
					runQueue();
			},

			clearGroup: function(group){
				this.queue.push({
					type: 'clearGroup',
					group: group
				});

				if(!_queueRunning)
					runQueue();
			}
		}

		var _queueRunning = false;

		var runQueue = function(){
			_queueRunning = true;

			switch(_me.queue[0].type){
				case 'subOnce':
					if(!_me.onceEventHandlers[_me.queue[0].event])
						_me.onceEventHandlers[_me.queue[0].event] = [];

					_me.onceEventHandlers[_me.queue[0].event].push({group: _me.queue[0].group, handler: _me.queue[0].handler});
					break;

				case 'sub':
					if(!_me.eventHandlers[_me.queue[0].event])
						_me.eventHandlers[_me.queue[0].event] = [];
					_me.eventHandlers[_me.queue[0].event].push({group: _me.queue[0].group, handler: _me.queue[0].handler});
					break;

				case 'pub':
					if(_me.onceEventHandlers[_me.queue[0].event]){
						for(var i = 0; i < _me.onceEventHandlers[_me.queue[0].event].length; i++)
							_me.onceEventHandlers[_me.queue[0].event][i].handler.apply(null, _me.queue[0].data);

						_me.onceEventHandlers[_me.queue[0].event] = [];
					}

					if(_me.eventHandlers[_me.queue[0].event]){
						for(var i = 0; i < _me.eventHandlers[_me.queue[0].event].length; i++)
							_me.eventHandlers[_me.queue[0].event][i].handler.apply(null, _me.queue[0].data);
					}
					break;

				case 'clearGroup':
					for(var e in _me.eventHandlers)
						for(var i = _me.eventHandlers[e].length-1; i >= 0; i--)
							if(_me.eventHandlers[e][i].group == _me.queue[0].group)
								_me.eventHandlers[e].splice(i, 1);

					for(var oE in _me.onceEventHandlers)
						for(var i = _me.onceEventHandlers[oE].length-1; i >= 0; i--)
							if(_me.onceEventHandlers[oE][i].group == _me.queue[0].group)
								_me.onceEventHandlers[oE].splice(i, 1);
					break;
			}

			_me.queue.splice(0, 1);

			if(_me.queue.length > 0)
				runQueue();
			else
				_queueRunning = false;
		}

		return _me;
	})

	.service('debugState', function($location){
		return {
			local: $location.host() == 'localhost'
		};
	});
