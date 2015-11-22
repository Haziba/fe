var socketId = Global.QueryStringValue("id");

if(!socketId)
	socketId =  window.location = '/?id=Harry';

var socket = io();

socket.emit('init', {id: socketId});

socket.on('init', function(data){
	window.bus.pub('socket init', data);
});

window.bus.sub('action new', function(action){
	socket.emit('action', action);
});

socket.on('action', function(action){
	window.bus.pub('action queue', action);
});