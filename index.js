var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.get('/spritesheet.png', function (req, res) {
    res.sendfile(__dirname + '\\spritesheet.png');
});

app.get('/gameClass.js', function (req, res) {
    res.sendfile(__dirname + '\\gameClass.js');
});

var mySocket;

io.on('connection', function(socket){
	console.log('a user has connected');
	socket.on('disconnect', function(){
		console.log('a user has disconnected');
	});
	socket.on('message', function(msg){
		console.log(msg);
	});
	
	mySocket = socket;
});

http.listen(8080, function(){
	console.log('listening on *:8080');
});