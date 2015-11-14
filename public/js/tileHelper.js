TileHelper = {
	GetAvailableMoves: function(tiles, unit){
		var open = [{pos: unit.GetPosition(), steps: 0}];
		var closed = [];
		
		var range = unit.MovementRange();
		var pos = unit.GetPosition();
		
		var CheckTile = function(currentTile, shift){
			var newTile = {pos: {x: currentTile.pos.x + shift.x, y: currentTile.pos.y + shift.y}, steps: currentTile.steps + 1};
			
			if(newTile.steps >= range || newTile.pos.x < 1 || newTile.pos.x >= tiles.length-1 || newTile.pos.y < 1 || newTile.pos.y >= tiles[0].length-1)
				return;
			
			for(var k = 0; k < closed.length; k++)
				if(closed[k].pos.x == newTile.pos.x && closed[k].pos.y == newTile.pos.y)
					return;
			
			for(var k = 0; k < open.length; k++)
				if(open[k].pos.x == newTile.pos.x && open[k].pos.y == newTile.pos.y)
					return;
			
			if(!tiles[newTile.pos.x][newTile.pos.y] || (typeof(tiles[newTile.pos.x][newTile.pos.y]) == 'object' && !tiles[newTile.pos.x][newTile.pos.y].MovementBlocking(unit.Team())))
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
		
		for(var i = closed.length-1; i >= 0; i--)
			if(!!tiles[closed[i].pos.x][closed[i].pos.y] && !(closed[i].pos.x == pos.x && closed[i].pos.y == pos.y))
				closed.splice(i, 1);
		
		return closed;
	},
	
	GetAvailableFights: function(unit, availableMoves){
		var availableFights = [];
		var range = unit.AttackRange();
		var pos = unit.GetPosition();
		
		for(var i = 0; i < availableMoves.length; i++)
		{
			for(var j = -range.max; j <= range.max; j++)
				for(var k = -range.max; k <= range.max; k++)
				{
					var fightPos = {x: availableMoves[i].pos.x + j, y: availableMoves[i].pos.y + k};
					
					if(this.TileOnScreen(fightPos))
						if(this.TilesInRange({x: 0, y: 0}, {x: j, y: k}, range) && !(pos.x == fightPos.x && pos.y == fightPos.y))
							availableFights.push({pos: fightPos, movePos: availableMoves[i]});
				}
		}
		
		var dedupedFights = [];
		while(availableFights.length > 0)
		{
			var fightSpace = availableFights.splice(0, 1)[0];
			
			for(var i = 0; i < availableFights.length; i++)
				if(availableFights[i].pos.x == fightSpace.pos.x && availableFights[i].pos.y == fightSpace.pos.y)
				{
					var newFightSpace = availableFights.splice(i, 1)[0];
					if(fightSpace.movePos.steps > newFightSpace.movePos.steps)
						fightSpace = newFightSpace;
				}
			
			dedupedFights.push(fightSpace);
		}
		
		return dedupedFights;
	},
	
	TilesInRange: function(posOne, posTwo, range){
		var dXSq = Math.pow(posOne.x - posTwo.x, 2);
		var dYSq = Math.pow(posOne.y - posTwo.y, 2);
		var distanceSq = dXSq + dYSq;
		
		var minRangeSq = Math.pow(range.min, 2);
		var maxRangeSq = Math.pow(range.max, 2);
		
		return distanceSq >= minRangeSq && distanceSq <= maxRangeSq;
	},
	
	TileOnScreen: function(tilePos){
		return tilePos.x >= 0 && tilePos.x < Global.ScreenSize().width && tilePos.y >= 0 && tilePos.y < Global.ScreenSize().height;
	}
}