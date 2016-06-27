var TileHelper = require('../public/js/game/tileHelper.js');

module.exports = function(){
  var verify = {
    'soldier move': function(game, user, data){
      var unit = game.data.units[data.unitId];
      var firstStep = data.move.path[0];
      var lastStep = data.move.path[data.move.path.length-1];

      // confirm owner of unit is attempting
      if(unit.team != user.id)
        return false;

      // confirm team is currently active
      if(game.data.activeTeam != unit.team)
        return false;

      // confirm unit is alive
      if(unit.stats.health <= 0)
        return false;

      // confirm unit can move that far
      if(unit.stats.moves.remaining <= data.move.steps)
        return false;

      // confirm first step in path is current location
      if(!(unit.pos.x == firstStep.x && unit.pos.y == firstStep.y))
        return false;

      // confirm total steps taken in path is 1 more than move steps
      if(data.move.steps != data.move.path.length-1)
        return false;

      // confirm each step leads on from the last
      for(var i = 1; i < data.move.path.length; i++){
        var xDiff = Math.abs(data.move.path[i-1].x - data.move.path[i].x);
        var yDiff = Math.abs(data.move.path[i-1].y - data.move.path[i].y);

        if(xDiff + yDiff != 1)
          return false;
      }

      // confirm that the final step is the pos
      if(!(data.move.pos.x == lastStep.x && data.move.pos.y == lastStep.y))
        return false;

      // confirm that each place is free to move through / to
      /* Tricky one */

      return true;
    },

    'soldier fight': function(game, user, data){
      var attacker = game.data.units[data.unitId];
      var defender = game.data.units[data.enemyUnitId];

      // confirm owner of unit is attempting
      if(attacker.team != user.id)
        return false;

      // confirm attacker's team is currently active
      if(game.data.activeTeam != attacker.team)
        return false;

      // confirm attacker is still alive
      if(attacker.stats.health <= 0)
        return false;

      // confirm defender is still alive
      if(defender.stats.health <= 0)
        return false;

      // confirm defender is of opposite team
      if(attacker.team == defender.team)
        return false;

      // confirm attacker has attacks remaining
      if(attacker.stats.fights.remaining <= 0)
        return false;

      // confirm attacker is in range to attack
      if(!TileHelper.TilesInRange(attacker.pos, defender.pos, attacker.stats.attackRange))
        return false;

      return true;
    },

    'soldier done': function(game, user, data){
      var unit = game.data.units[data.unitId];

      // confirm owner of unit is attempting
      if(unit.team != user.id)
        return false;

      // confirm attacker's team is currently active
      if(game.data.activeTeam != unit.team)
        return false;

      // confirm attacker is still alive
      if(unit.stats.health <= 0)
        return false;

      // confirm soldier isn't already done
      if(!unit.waiting)
        return false;

      return true;
    },

    'turn end': function(game, user, data){
      console.log('verify turn end', data);

      // confirm team is currently active
      if(game.data.activeTeam != user.id)
        return false;

      return true;
    }
  }

  // action {type, data}
  return function(game, action){
    var valid = verify[action.type](game, action.user, action.data);

    if(!valid)
      console.log("Action invalid: ", action);

    return valid;
  }
}

/*
  case 'soldier move':
    return MoveSoldier(game, action.data);
  case 'soldier fight':
    return ResolveFight(game, action.data);
  case 'soldier done':
    return SoldierDone(game, action.data);
  case 'turn end':
    return TurnEnd(game);
*/
