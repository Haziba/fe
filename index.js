var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.get('/spritesheet.png', function (req, res) {
    res.sendfile(__dirname + '\\spritesheet.png');
});

app.get('/gameClass.js', function (req, res) {
    res.sendfile(__dirname + '\\gameClass.js');
});

app.use(express.static('public'));

var sockets = {};
var teams = [0, 1];

io.on('connection', function(socket){
	var socketId;
	
	socket.on('disconnect', function(){
		if(sockets[socketId])
			teams.push(sockets[socketId].team);
		
		delete sockets[socketId];
	});
	
	socket.on('init', function(msg){
		socketId = msg.id;
		
		console.log("connected", msg.id);
		
		var team = teams.splice(Math.floor(Math.random() * teams.length), 1)[0];
		
		socket.emit('init', {team: team});
		
		sockets[socketId] = {team: team, s: socket};
	});
	
	socket.on('update', function(message){
		message.event = 'socket ' + message.event;
		
		for(var s in sockets)
			if(sockets[s].s !== socket)
			{
				console.log("Emit", s, message);
				sockets[s].s.emit('update', message);
			}
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});