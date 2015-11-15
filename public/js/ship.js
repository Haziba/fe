var NewShip = function(initData){
	var _me = {};
	
	var _pos = initData.pos;
	var _team = initData.team;
	
	_me.GetPosition = function(){
		return _pos;
	}
	
	_me.GetTeam = function(){
		return _team;
	}
	
	return _me;
}