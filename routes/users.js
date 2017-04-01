// Login and sign up route handlers

var express = require('express'),
    router = express.Router();

 // route middleware that will happen on every request
router.use(function(req, res, next) {

    // log each request to the console
    console.log(req.method, req.url);

    // continue doing what we were doing and go to the route
    next(); 
});

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