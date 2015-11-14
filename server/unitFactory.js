module.exports = function(enums){
	return {
		NewArcher: function(team, pos){
			var stats = BaseStats();
			
			stats.health = stats.maxHealth = 12;
			stats.strength = 8;
			
			return BaseUnit(enums.Soldier.ARCHER, pos, team, stats);
		},
		
		NewSword: function(team, pos){
			var stats = BaseStats();
			
			stats.health = stats.maxHealth = 12;
			stats.strength = 8;
			
			return BaseUnit(enums.Soldier.SWORD, pos, team, stats);
		},
		
		NewAxe: function(team, pos){
			var stats = BaseStats();
			
			stats.health = stats.maxHealth = 24;
			stats.strength = 12;
			stats.moves.remaining = stats.moves.max = 3;
			
			return BaseUnit(enums.Soldier.AXE, pos, team, stats);
		},
		
		NewSpear: function(team, pos){
			var stats = BaseStats();
			
			stats.health = stats.maxHealth = 16;
			stats.strength = 8;
			stats.moves.remaining = stats.moves.max = 5;
			
			return BaseUnit(enums.Soldier.SPEAR, pos, team, stats);
		}
	};
}

var BaseStats = function(){
	return {
		health: 20,
		maxHealth: 20,
		strength: 10,
		armour: 5,
		moves: {
			remaining: 4,
			max: 4
		},
		fights: {
			remaining: 1,
			max: 1
		}
	};
}

var BaseUnit = function(type, pos, team, stats){
	return {
		pos: pos,
		type: type,
		team: team,
		waiting: true,
		stats: stats
	};
}

/*			'HarrySoldierOne': {
				pos: {x: 2, y: 2},
				type: enums.Soldier.AXE,
				team: 0,
				waiting: true,
				stats: {
					health: 18,
					maxHealth: 18,
					strength: 12,
					armour: 8,
					moves: {
						remaining: 4,
						max: 4
					},
					fights: {
						remaining: 1,
						max: 1
					}
				}
			}*/