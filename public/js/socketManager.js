$(function(){
	var socketId = Global.QueryStringValue("id");
	var playerName = Global.QueryStringValue("name")
	var player = undefined;

	var socket = io();
	var serverTimeOffset;

	socket.on('init', function(data){
		serverTime = (new Date()).getTime() - data.serverTime;
		
		if(data.inGame)
			window.bus.pub('game init', data.game);
		else
			window.bus.pub('lobby init', data.onlinePlayers);
	});

	window.bus.sub('player init', function(p){
		Global.player = p;

		socket.emit('init', Global.player);
		
		startGame();
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

	if(socketId)
		window.bus.pub('player init', {id: socketId, name: playerName});
	else
		window.bus.pub('facebook login');
});