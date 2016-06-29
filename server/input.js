var StringDecoder = require('string_decoder').StringDecoder;

module.exports = function(users){
  return {
    process: function(buffer){
      var decoder = new StringDecoder('utf8');
      var input = decoder.write(buffer);
      input = input.slice(0, -1);

      switch(input){
        case "user.all":
          users.all().then(function(user){
            console.log("Users:", user);
          });
          break;
        case "user.first":
          users.getById('1').then(function(user){
            console.log("User:", user);
          });
          break;
        case "user.first.units":
          users.getById('1').then(function(user){
            console.log("Units:", user.units);
          });
      }
    }
  }
}
