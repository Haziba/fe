module.exports = {
	eventHandlers: {},
	onceEventHandlers: {},
	
	subOnce: function(event, handler, group){
		if(!this.onceEventHandlers[event])
			this.onceEventHandlers[event] = [];
		
		this.onceEventHandlers[event].push({group: group, handler: handler});
	},
	
	sub: function(event, handler, group)
	{
		if(!this.eventHandlers[event])
			this.eventHandlers[event] = [];
		this.eventHandlers[event].push({group: group, handler: handler});
	},
	
	pub: function(event)
	{
		var data = [].splice.call(arguments, 1);
		
		if(this.onceEventHandlers[event]){
			for(var i = 0; i < this.onceEventHandlers[event].length; i++)
				this.onceEventHandlers[event][i].handler.apply(null, data);
			
			this.onceEventHandlers[event] = [];
		}
		
		if(this.eventHandlers[event]){
			for(var i = 0; i < this.eventHandlers[event].length; i++)
				this.eventHandlers[event][i].handler.apply(null, data);
		}
	},
	
	clearGroup: function(group){
		for(var i = this.eventHandlers.length-1; i >= 0; i--)
			if(this.eventHandlers[i].group == group)
				this.eventHandlers.splice(i, 1);
		
		for(var i = this.onceEventHandlers.length-1; i >= 0; i--)
			if(this.onceEventHandlers[i].group == group)
				this.onceEventHandlers.splice(i, 1);
	}
}