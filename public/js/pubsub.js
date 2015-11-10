window.bus = {
	eventHandlers: {},
	
	sub: function(event, handler)
	{
		if(!this.eventHandlers[event])
			this.eventHandlers[event] = [];
		this.eventHandlers[event].push(handler);
	},
	
	pub: function(event)
	{
		if(!this.eventHandlers[event])
			return;
		
		var data = [].splice.call(arguments, 1);
		
		for(var i = 0; i < this.eventHandlers[event].length; i++)
			this.eventHandlers[event][i].apply(null, data);
	}
}