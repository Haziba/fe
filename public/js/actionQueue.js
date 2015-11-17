var NewActionQueue = function(_soldierManager){
	var _queue = [];
	
	window.bus.sub('action create', function(action){
		_queue.push(NewAction(action.action, action.data));
		
		if(_queue.length == 1)
			_queue[0].Process(_soldierManager);
	});
	
	window.bus.sub('action complete', function(){
		_queue.splice(0, 1);
		
		if(_queue.length > 0)
			_queue[0].Process(_soldierManager);
	});
};