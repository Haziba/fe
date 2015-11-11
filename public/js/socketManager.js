var socketId = Global.QueryStringValue("id");

if(!socketId)
	socketId =  Global.NewId(true);

var socket = io();

socket.emit('init', {id: socketId});

socket.on('init', function(data){
	window.bus.pub('socket init', data);
});

var fireSocketUpdate = function(update){
	console.log(update);
	socket.emit('update', update);
}

window.bus.sub('soldier move', function(soldier){
	if(soldier.Team() == Team.ME)
		socket.emit('update', {event: 'soldier move', data: {id: soldier.id, pos: soldier.GetPosition()}});
});

socket.on('update', function(message){
	window.bus.pub(message.event, message.data);
});