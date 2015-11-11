TileHelper = {
	GetAvailableMoves: function(tiles, unit){
		var open = [{pos: unit.GetPosition(), h: 0}];
		var closed = [];
		
		var range = unit.MovementRange();
		var pos = unit.GetPosition();
		
		var CheckTile = function(currentTile, shift){
			var newTile = {pos: {x: currentTile.pos.x + shift.x, y: currentTile.pos.y + shift.y}, h: currentTile.h + 1};
			
			if(newTile.h >= range || newTile.pos.x < 1 || newTile.pos.x >= tiles.length-1 || newTile.pos.y < 1 || newTile.pos.y >= tiles[0].length-1)
				return;
			
			for(var k = 0; k < closed.length; k++)
				if(closed[k].pos.x == newTile.pos.x && closed[k].pos.y == newTile.pos.y)
					return;
			
			for(var k = 0; k < open.length; k++)
				if(open[k].pos.x == newTile.pos.x && open[k].pos.y == newTile.pos.y)
					return;
			
			if(!tiles[newTile.pos.x][newTile.pos.y])
				open.push(newTile);
		}
		
		while(open.length > 0)
		{
			var currentTile = open.splice(0, 1)[0];
			closed.push(currentTile);
			
			CheckTile(currentTile, {x: -1, y: 0});
			CheckTile(currentTile, {x: 1, y: 0});
			CheckTile(currentTile, {x: 0, y: -1});
			CheckTile(currentTile, {x: 0, y: 1});
		}
		
		var moves = [];
		for(var i = 0; i < closed.length; i++)
			moves.push(closed[i].pos);
		
		return moves;
	},
	
	GetAvailableFights: function(unit, availableMoves){
		var availableFights = [];
		var range = unit.AttackRange();
		var pos = unit.GetPosition();
		
		var minRangeSq = Math.pow(range.min, 2);
		var maxRangeSq = Math.pow(range.max, 2);
		
		for(var i = 0; i < availableMoves.length; i++)
		{
			for(var j = -range.max; j <= range.max; j++)
				for(var k = -range.max; k <= range.max; k++)
				{
					var fightPos = {x: availableMoves[i].x + j, y: availableMoves[i].y + k};
					var distanceSq = Math.pow(j, 2) + Math.pow(k, 2);
					if(distanceSq >= minRangeSq && distanceSq <= maxRangeSq && !(pos.x == fightPos.x && pos.y == fightPos.y))
						availableFights.push(fightPos);
				}
		}
		
		return availableFights;
	}
}