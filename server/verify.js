module.exports = function(){
  var verify = {
    'soldier move': function(game, data){
      console.log('verify soldier move', data);

      var unit = game.data.units[data.unitId];
      var firstStep = data.move.path[0];
      var lastStep = data.move.path[data.move.path.length-1];

      // confirm team is currently active
      if(game.data.activeTeam != unit.team)
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

    'soldier fight': function(game, data){
      console.log('verify soldier fight', data);

      return true;
    },

    'soldier done': function(game, data){
      console.log('verify soldier done', data);

      return true;
    },

    'turn end': function(game, data){
      console.log('verify turn end', data);

      return true;
    }
  }

  // action {type, data}
  return function(game, action){
    return verify[action.type](game, action.data);
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
