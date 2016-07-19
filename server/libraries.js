module.exports = function(db, bus){
	return {
		Item: require('./libraries/items.js')(),
		Level: require('./libraries/levels.js')(),
	}
}
