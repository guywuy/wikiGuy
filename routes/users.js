// Login and sign up route handlers

var express = require('express'),
    router = express.Router();

/* GET /users page. */
router.get('/', function(req, res, next) {
  var context = {
		'title': 'Users'
	};
	res.render('home', context);
});

//Login page
router.get('/login', function(req, res){
	var context = {
		'title': 'Log in'
	};
	res.render('login', context);
});
router.post('/login', function(req, res){

});

//Sign up page
router.get('/signup', function(req, res){
	var context = {
		'title': 'Sign up'
	};
	res.render('signup', context);
});
router.post('/signup', function(req, res){

});

//View user's information
router.get('/:id', function(req, res){
	res.redirect('/');
});

module.exports = router;