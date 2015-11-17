var NewAction = function(_action, _data){
	var _me = {};
	
	_me.Process = function(soldierManager){
		window.bus.pub('action complete');
	}
	
	return _me;
}