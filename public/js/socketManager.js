var socketId = Global.QueryStringValue("id");

if(!socketId)
	socketId =  window.location = '/?id=Harry';

var socket = io();
var serverTimeOffset;

socket.emit('init', {id: socketId});

socket.on('init', function(data){
	serverTime = (new Date()).getTime() - data.serverTime;
	
	if(data.inGame)
		window.bus.pub('game init', data.game);
	else
		window.bus.pub('lobby init', data.onlinePlayers);
});

window.bus.sub('action new', function(action){
	socket.emit('action', action);
});

socket.on('action', function(action){
	window.bus.pub('action queue', action);
});

window.bus.sub('lobby', function(action){
	socket.emit('lobby', action);
});

socket.on('lobby', function(action){
	window.bus.pub('lobby', action);
});