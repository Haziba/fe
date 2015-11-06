var NewStageManager = function() {
	var oldSoldierPositions = {};
	
	var tiles = [];
	
	for(var i = 0; i < 35; i++) {
		tiles[i] = [];
		for(var j = 0; j < 25; j++)
			tiles[i][j] = undefined;
	}
	
	window.bus.sub('soldier move', function(soldier){
		var oldPosition = oldSoldierPositions[soldier];
		var newPosition = soldier.GetPosition();
		
		tiles[oldPosition.x][newPosition.y] = soldier;
		tiles[newPosition.x][newPosition.y] = soldier;
		
		oldSoldierPositions[soldier] = newPosition;
	});
	
	window.bus.sub('soldier place', function(soldier){
		var newPosition = soldier.GetPosition();
		
		tiles[newPosition.x][newPosition.y] = soldier;
		
		oldSoldierPositions[soldier] = newPosition;
		
		debugger;
	});
}