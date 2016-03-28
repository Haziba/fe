App.service('bus', function(){
		return {
			eventHandlers: {},
			onceEventHandlers: {},
			
			subOnce: function(event, handler){
				if(!this.onceEventHandlers[event])
					this.onceEventHandlers[event] = [];
				this.onceEventHandlers[event].push(handler);
			},
			
			sub: function(event, handler)
			{
				if(!this.eventHandlers[event])
					this.eventHandlers[event] = [];
				this.eventHandlers[event].push(handler);
			},
			
			pub: function(event)
			{
				var data = [].splice.call(arguments, 1);
				
				if(this.onceEventHandlers[event]){
					for(var i = 0; i < this.onceEventHandlers[event].length; i++)
						this.onceEventHandlers[event][i].apply(null, data);
					
					this.onceEventHandlers[event] = [];
				}
				
				if(this.eventHandlers[event]){
					for(var i = 0; i < this.eventHandlers[event].length; i++)
						this.eventHandlers[event][i].apply(null, data);
				}
			}
		}
	});