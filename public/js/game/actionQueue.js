var NewActionQueue = function(_soldierManager, _stageManager, _hud){
	var _queue = [];

	var Process = function(action){
		action.Process(_soldierManager, _stageManager, _hud);
	}

	/*window.bus.sub('action new', function(action){
		window.bus.pub('action queue', action);
	}, 'game');*/

	window.bus.sub('action queue', function(action){
		//console.log('new action???', action);
		_queue.push(NewAction(action.action, action.response));

		if(_queue.length == 1)
			Process(_queue[0]);
	}, 'game');

	window.bus.sub('action complete', function(){
		_queue.splice(0, 1);

		if(_queue.length > 0)
			Process(_queue[0]);
	}, 'game');
};
