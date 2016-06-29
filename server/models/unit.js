module.exports = function(type){
  var names = ["Herbert", "Sherbert", "Shirleybert", "Burlyshirt", "Shirley"];

  this.name = names[Math.floor(Math.random() * names.length)];
}
