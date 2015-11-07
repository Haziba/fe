var SpriteHandler = {
	Initialise: function(context, spriteSheet){
		this.context = context;
		this.spriteSheet = spriteSheet;
	},
	
	Clear: function(){
		this.context.clearRect(0, 0, 800, 600);
	},
	
	Draw: function(spriteId, location){
		this.context.drawImage(this.spriteSheet, spriteId.x * 40, spriteId.y * 40, 40, 40, location.x, location.y, 20, 20);
	}
}

var Sprite = {
	GRASS: {x: 0, y: 0},
	BRICK: {x: 1, y: 0},
	KING: {x: 2, y: 0},
	SWORD: {x: 0, y: 1},
	AXE: {x: 1, y: 1},
	SPEAR: {x: 2, y: 1},
	BOW: {x: 0, y: 2},
	YOUR_UNIT: {x: 1, y: 2},
	THEIR_UNIT: {x: 2, y: 2},
	FADE_OUT: {x: 0, y: 3},
	HEALTH_FULL: {x: 1, y: 3},
	HEALTH_EMPTY: {x: 2, y: 3},
	CURSOR: {x: 0, y: 4},
	SELECTION: {x: 1, y: 4},
	BLUE: {x: 3, y: 0},
	RED: {x: 3, y: 1}
};