var NewActionQueue = function(_soldierManager, _stageManager){
	var _queue = [];
	
	var Process = function(action){
		action.Process(_soldierManager, _stageManager);
	}
	
	window.bus.sub('action new', function(action){
		window.bus.pub('action queue', action);
	});
	
	window.bus.sub('action queue', function(action){
		_queue.push(NewAction(action.action, action.data));
		
		if(_queue.length == 1)
			Process(_queue[0]);
	});
	
	window.bus.sub('action complete', function(){
		_queue.splice(0, 1);
		
		if(_queue.length > 0)
			Process(_queue[0]);
	});
};