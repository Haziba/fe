var socketId = Global.QueryStringValue("id");

if(!socketId)
	socketId =  window.location = '/?id=Harry';

var socket = io();
var serverTimeOffset;

socket.emit('init', {id: socketId});

socket.on('init', function(data){
	serverTime = (new Date()).getTime() - data.serverTime;
	
	console.log(serverTime);
	
	window.bus.pub('socket init', data.game);
});

window.bus.sub('action new', function(action){
	socket.emit('action', action);
});

socket.on('action', function(action){
	window.bus.pub('action queue', action);
});