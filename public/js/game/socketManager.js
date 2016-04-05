$(function(){
	var socketId = Global.QueryStringValue("id");
	var userName = Global.QueryStringValue("name")
	var user = undefined;

	var serverTimeOffset;

	window.bus.sub('action new', function(action){
		//socket.emit('action', action);
	});

	socket.on('action', function(action){
		window.bus.pub('action queue', action);
	});
});