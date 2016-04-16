module.exports = function(app, users, models){
  app.get('/locallogin', function(req, res){
    if(!req.param('userId')){
      res.status(403).send('No userId');
      return;
    }

    users.getById(req.param('userId')).then(function(user){
      if(!user){
        res.status(403).send('User does not exist');
      }else{
        user.localLogins++;
        console.log(user);
        users.set(user).then(function(user){
          res.render('index', {user: user});
        });
      }
    });
  });

  app.get('/localcreate', function(req, res){
    if(!req.param('userId') || !req.param('displayName')){
      res.status(403).send('No userId or displayName');
      return;
    }

    users.getById(req.param('userId')).then(function(user){
      if(user){
        res.status(403).send('User already exists');
      }else{
				user = models.User.new(req.param('userId'), req.param('displayName'));

				user.localLogins++;
				users.set(user).then(function(){
          res.redirect('/locallogin?userId=' + req.param('userId'));
				});
      }
    })
  });
}
