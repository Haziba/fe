var StringDecoder = require('string_decoder').StringDecoder;

module.exports = function(managers, libraries){
  return {
    process: function(buffer){
      var decoder = new StringDecoder('utf8');
      var input = decoder.write(buffer);
      input = input.slice(0, -1);

      switch(input){
        case "user.all":
          managers.User.all().then(function(user){
            console.log("Users:", user);
          });
          break;
        case "user.first":
          managers.User.getById('1').then(function(user){
            console.log("User:", user);
          });
          break;
        case "user.first.inventory.first.inc":
          managers.User.getById('1').then(function(user){
            user.inventory[0].available++;
            managers.User.set(user, function(){
              console.log("Success");
            }, function(e){
              console.log("Failure", e);
            });
          });
          break;
        case "user.first.units":
          managers.User.getById('1').then(function(user){
            console.log("Units:", user.units);
          });
          break;
        case "item.all":
          console.log("Items:", libraries.Item.all());
          break;
        default:
          console.log("What?");
          break;
      }
    }
  }
}
