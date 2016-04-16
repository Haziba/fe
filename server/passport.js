module.exports = function(express, app, users, models){
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var session = require('express-session');
	var passport = require('../passport/lib/index.js');
	var FacebookStrategy = require('passport-facebook').Strategy;

	app.use(cookieParser());
	app.use(bodyParser.urlencoded());
	app.use(bodyParser.json());
	app.use(session({secret: 'hrld'}));
	app.use(passport.initialize({
		woo: true
	}));
	app.use(passport.session());

	app.get('/fblogin', function(req, res){
		if(req.isAuthenticated())
			res.render('index', {
				user: req.user
			});
		else
			res.render('login', {
				authUrl: req.param('authUrl')
			});
	});

	passport.serializeUser(function(user, cb) {
		cb(null, user.id);
	});

	passport.deserializeUser(function(userId, cb) {
		users.getById(userId).then(function(user){
			cb(null, user);
		});
	});

	passport.use(new FacebookStrategy({
			clientID: "951320921624338",
			clientSecret: "417bd575ccdf3d85c254cba5e058211a",
			callbackURL: "https://fe-haziba.rhcloud.com/auth/facebook/callback",
			enableProof: true
	  },
	  function(accessToken, refreshToken, profile, cb) {
			users.getById(profile.id).then(function(user){
				if(!user){
					user = models.User.new(profile.id, profile.displayName);
				}

				user.fbLogins++;
				users.set(user).then(function(){
					cb(null, profile);
				});
			});
		}));

	app.post('/auth/facebook',
		passport.authenticate('facebook', {
		  successRedirect: '/'
	  }));

	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
		  successRedirect: 'https://apps.facebook.com/battlelandwars/?test=true'
	  }));
}
