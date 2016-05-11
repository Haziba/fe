var NewSprite = function(sprite){
  var currentFrame = {x: 0, y: 0};
  var spriteAction = SPRITE_ACTION.STAND;

  var nextFrameDelay = 10;
  var nextFrameCountdown = 0;

  return {
    NextFrame: function(){
      nextFrameCountdown--;

      if(nextFrameCountdown > 0)
        return;

      nextFrameCountdown = nextFrameDelay;

      currentFrame.x++;

      if(sprite.animations[spriteAction].end.x < currentFrame.x)
        currentFrame.y++;
      if(sprite.animations[spriteAction].end.y < currentFrame.y){
        currentFrame.x = sprite.animations[spriteAction].start.x;
        currentFrame.y = sprite.animations[spriteAction].start.y;
      }
    },

    ChangeAction: function(action){
      if(spriteAction == action)
        return;
      spriteAction = action;
      currentFrame = {x: sprite.animations[spriteAction].start.x, y: sprite.animations[spriteAction].start.y};
    },

    Draw: function(location){
      SpriteHandler.DrawSprite(sprite.spriteSheet, currentFrame, location, sprite.size)
    }
  }
}

var SPRITE_SHEETS = {
  SOLDIER: 0
}

var SPRITE_ACTION = {
  STAND: 0,
  WALK_UP: 1,
  WALK_LEFT: 2,
  WALK_DOWN: 3,
  WALK_RIGHT: 4,
}

var SPRITES = {
  SOLDIER: {
    id: 0,
    spriteSheet: SPRITE_SHEETS.SOLDIER,
    size: {width: 40, height: 40},
    animations: {}
  }
}

SPRITES.SOLDIER.animations[SPRITE_ACTION.STAND] = {
  start: {x: 0, y: 0},
  end: {x: 0, y: 0}
};
SPRITES.SOLDIER.animations[SPRITE_ACTION.WALK_UP] = {
  start: {x: 0, y: 1},
  end: {x: 8, y: 1}
};
SPRITES.SOLDIER.animations[SPRITE_ACTION.WALK_LEFT] = {
  start: {x: 0, y: 2},
  end: {x: 8, y: 2}
};
SPRITES.SOLDIER.animations[SPRITE_ACTION.WALK_DOWN] = {
  start: {x: 0, y: 3},
  end: {x: 8, y: 3}
};
SPRITES.SOLDIER.animations[SPRITE_ACTION.WALK_RIGHT] = {
  start: {x: 0, y: 4},
  end: {x: 8, y: 4}
};
