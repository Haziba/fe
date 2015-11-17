var socketId = Global.QueryStringValue("id");

if(!socketId)
	socketId =  window.location = '/?id=Harry';

var socket = io();

socket.emit('init', {id: socketId});

socket.on('init', function(data){
	window.bus.pub('socket init', data);
});

/*var fireSocketUpdate = function(update){
	console.log(update);
	socket.emit('update', update);
}*/

window.bus.sub('action new', function(action){
	socket.emit('action', action);
});

socket.on('action', function(action){
	window.bus.pub('action queue', action);
})

/*window.bus.sub('soldier move start', function(data){
	socket.emit('process', {event: 'soldier move start', data: data});
});

window.bus.sub('soldier fight start', function(combatants){
	socket.emit('process', {event: 'soldier fight start', data: combatants});
});

window.bus.sub('game reset start', function(){
	socket.emit('process', {event: 'game reset start'});
});

window.bus.sub('turn end start', function(){
	socket.emit('process', {event: 'turn end start'});
});

window.bus.sub('soldier done start', function(unit){
	socket.emit('process', {event: 'soldier done start', data: unit});
});

socket.on('process', function(message){
	window.bus.pub(message.event, message.data);
});*/