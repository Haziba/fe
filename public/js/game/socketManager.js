$(function(){
	var socketId = Global.QueryStringValue("id");
	var userName = Global.QueryStringValue("name")
	var user = undefined;

	var socket = io();
	var serverTimeOffset;

	window.bus.sub('action new', function(action){
		socket.emit('action', action);
	});

	socket.on('action', function(action){
		window.bus.pub('action queue', action);
	});
});