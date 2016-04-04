var NewActionQueue = function(_soldierManager, _stageManager, _hud){
	var _queue = [];
	
	var Process = function(action){
		action.Process(_soldierManager, _stageManager, _hud);
	}
	
	/*window.bus.sub('action new', function(action){
		window.bus.pub('action queue', action);
	});*/
	
	window.bus.sub('action queue', function(action){
		_queue.push(NewAction(action.action, action.response));
		
		console.log("New action", action, _queue);
		
		if(_queue.length == 1)
			Process(_queue[0]);
	});
	
	window.bus.sub('action complete', function(){
		_queue.splice(0, 1);
		
		if(_queue.length > 0)
			Process(_queue[0]);
	});
};