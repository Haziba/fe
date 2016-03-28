var Io = require('socket.io');

var sockets = {};

module.exports = function(bus, server){
	var io = Io(server);
	var currentSocketId = 0;
	
	io.on('connection', function(socket){
		socket.id = currentSocketId++;
		sockets[socket.id] = socket;
		
		bus.sub('socket message ' + socket.id, function(msg){
			socket.emit('message', msg);
		});
		
		bus.pub('socket connected', socket.id);
		
		console.log("connected", socket.id);
		
		socket.on('disconnect', function(){
			bus.pub('socket disconnect ' + socket.id);
			
			delete sockets[socket.id];
		
			console.log("disconnected", socket.id);
		});
		
		socket.on('lobby', function(msg){
			msg.socketId = socket.id;
			
			console.log('lobby', msg);
			
			bus.pub('lobby message', msg);
		});
	});
	
	// For sending messages to multiple peeps
	bus.sub('socket message', function(msgSockets, msg){
		for(var i = 0; i < msgSockets.length; i++)
			sockets[msgSockets[i]].emit('message', msg);
	});
}