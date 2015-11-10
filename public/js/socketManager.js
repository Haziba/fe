var myId = Global.NewId(true);

var socket = io();

socket.emit('init', {id: myId});

socket.on('init', function(data){
	window.bus.pub('socket init', data);
});

var fireSocketUpdate = function(update){
	console.log(update);
	socket.emit('update', update);
}

window.bus.sub('soldier move', function(soldier){
	socket.emit('update', {event: 'soldier move', data: {id: soldier.id, pos: soldier.GetPosition()}});
});

socket.on('update', function(message){
	window.bus.pub(message.event, message.data);
});