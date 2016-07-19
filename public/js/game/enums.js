var Soldier = {
	SWORD: 0,
	AXE: 1,
	SPEAR: 2,
	ARCHER: 3
}

var Team = {
	ME: 0,
	ENEMY: 1
}

var GameState = {
	PLAYING: 0,
	FINISHED_SHIP: 1,
	FINISHED_SLAUGHTER: 2
}

var Unit = {
	BARBARIAN: 0,
}

var EquipmentSlot = {
	CHEST: 0,
	LEFT_HAND: 1,
	RIGHT_HAND: 2,
	HELMET: 3,
}

if(typeof exports !== "undefined"){
	exports.Soldier = Soldier;
	exports.Team = Team;
	exports.GameState = GameState;
	exports.Unit = Unit;
	exports.EquipmentSlot = EquipmentSlot;
}
