module.exports = function(db, bus){
	return {
		User: require('./managers/users.js')(db, bus),
	}
}
