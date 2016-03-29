var Io = require('socket.io');

module.exports = function(bus, server){
	var io = Io(server);
	var currentSocketId = 0;
	
	var onlineUsers = {};
	var sockets = {};
	
	io.on('connection', function(socket){
		socket.id = currentSocketId++;
		sockets[socket.id] = socket;
		onlineUsers[socket.id] = {
			socketId: socket.id
		};
		
		bus.sub('socket message ' + socket.id, function(area, msg){
			socket.emit(area, msg);
		});
		
		bus.pub('socket connect ' + socket.id);
		
		console.log("connected", socket.id);
		
		socket.on('init', function(userId){
			onlineUsers[socket.id].id = userId;
		});
		
		socket.on('disconnect', function(){
			bus.pub('socket disconnect ' + socket.id);
			
			delete onlineUsers[socket.id];
		
			console.log("disconnected", socket.id);
		});
		
		socket.on('lobby', function(msg){
			msg.user = onlineUsers[socket.id];
			
			console.log('lobby', msg);
			
			bus.pub('lobby action', msg);
		});
		
		socket.on('game', function(msg){
			msg.user = onlineUsers[socket.id];
			
			console.log('game', msg);
			
			bus.pub('game ' + msg.gameId + ' action', msg);
		});
	});
	
	// For sending messages to multiple sockets
	bus.sub('socket message', function(msgSockets, area, msg){
		for(var i = 0; i < msgSockets.length; i++)
			if(onlineUsers[msgSockets[i]])
				onlineUsers[msgSockets[i]].emit(area, msg);
	});
}