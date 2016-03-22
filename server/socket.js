var Io = require('socket.io');

var sockets = {};

module.exports = function(server){
	var io = Io(server);
	var currentSocketId = 0;
	
	io.on('connection', function(socket){
		socket.id = currentSocketId++;
		sockets[socket.id] = socket;
		
		console.log("connected", socket.id);
		
		socket.on('disconnect', function(){
			bus.pub('socket disconnect ' + socket.id);
			
			delete sockets[socket.id];
		
			console.log("disconnected", socket.id);
		});
	});
}