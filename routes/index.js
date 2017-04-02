var express = require('express');
var router = express.Router();
var cookie = require('cookie');

var check = require('../routes/validity');
var loggedIn = false;


 // route middleware that will happen on every request
router.use(function(req, res, next) {
    // Parse the cookies on the request 
	var cookies = cookie.parse(req.headers.cookie || '');

    loggedIn = check.loggedIn(cookies);
    console.log("Logged in = " + loggedIn);

    next(); 
});


/* GET home page. */
router.get('/', function(req, res, next) {
  var context = {
		'title': 'WikiGuy'
	};
	res.render('home', context);
});

router.get('/logout', function(req, res) {
	res.clearCookie('name');
	res.redirect('/');
});

module.exports = router;