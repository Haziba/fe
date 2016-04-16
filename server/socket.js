var Io = require('socket.io');

module.exports = function(bus, server){
	var io = Io(server);
	var currentSocketId = 0;

	// This stinks. onlineUsers's keys are the socketId, but then it contains the socketId because it gets passed around, but I need a {userId, socketId} object. Bleh
	var onlineUsers = {};
	var sockets = {};

	io.on('connection', function(socket){
		socket.id = currentSocketId++;
		sockets[socket.id] = socket;
		var user = {
			socketId: socket.id
		};

		bus.sub('socket message ' + socket.id, function(area, msg){
			console.log('outbound', socket.id, area, msg);
			socket.emit(area, msg);
		});

		bus.pub('socket connect ' + socket.id);

		bus.sub('game start', function(gameStart){
			for(var i = 0; i < gameStart.users.length; i++)
				user.inGame = true;
		});

		//todo: Hook this bad boy up
		bus.sub('game end', function(gameEnd){
			for(var i = 0; i < gameEnd.users.length; i++)
				user.inGame = false;
		});

		console.log("connected", socket.id);

		socket.on('init', function(userId){
			console.log('Socket init', socket.id, userId);

			user = {
				id: parseInt(userId),
				socketId: socket.id
			};
			console.log('user connect', user);
			bus.pub('user connect', user);
			bus.pub('user connect ' + userId, user);

			onlineUsers[user.id] = user;
		});

		socket.on('disconnect', function(){
			bus.pub('socket disconnect ' + socket.id);
			if(onlineUsers[user.id])
				bus.pub('user disconnect ' + user.id);

			delete sockets[socket.id];
			if(onlineUsers[user.id])
				delete onlineUsers[user.id];

			console.log("disconnected", socket.id);
		});

		socket.on('lobby', function(msg){
			msg.user = user;

			console.log('lobby', msg);

			bus.pub('lobby action', msg);
		});

		socket.on('game', function(msg){
			msg.user = user;

			console.log('game', msg.gameId, msg);

			bus.pub('game ' + msg.gameId + ' action', msg);
		});
	});

	// For sending messages to multiple sockets
	bus.sub('socket message', function(msgSockets, area, msg){
		console.log('outbound multi message', msgSockets, area, msg);

		for(var i = 0; i < msgSockets.length; i++)
			if(sockets[msgSockets[i]]){
				sockets[msgSockets[i]].emit(area, msg);
			}
	});

	return {
		isUserInGame: function(userId){
			console.log(userId, onlineUsers);
			return onlineUsers[userId].inGame;
		}
	};
}
