// Login and sign up route handlers

var express = require('express');
var router = express.Router();
var cookie = require('cookie');
var mongoose = require('mongoose');

var check = require('../routes/validity');
var loggedIn = false;
var username;

 // route middleware that will happen on every request
router.use(function(req, res, next) {
    // Parse the cookies on the request 
	var cookies = cookie.parse(req.headers.cookie || '');
	if (cookies.name) username = cookies.name.split(":")[0];
    loggedIn = check.loggedIn(cookies);
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
	if(loggedIn){
		res.redirect('/');
	} else {
		var context = {
			'title': 'Log in',
			'loggedInUser' : username
			};
		res.render('login', context);
	}
});
router.post('/login', function(req, res){
	// Check that user exists in db and their pw is correct.
	// If both true, redirect to /, else reload page w/error.
	mongoose.model('User').findOne({
		name: req.body.name
	}, function(err, user) {
		if (err) {
			console.log("Username not found in db")
			res.render('login', {
				'title': 'Log in again',
				'loggedInUser' : username
			});
		}
		// If user exists in Database
		if (user) {
			// If entered password matches hashed password in database
			if (user.password === check.hashPassword(req.body.password)) {
				console.log("Username and password correct. Setting a cookie and redirecting to /");
				if (req.body.remember) {
					res.setHeader('Set-Cookie', cookie.serialize('name', check.hashName(String(req.body.name)), {
						httpOnly: true,
						path: '/',
						maxAge: 60 * 60 * 24 * 7 // 1 week 
					}));
				} else {
					// don't set max age so only is session cookie.
					res.setHeader('Set-Cookie', cookie.serialize('name', check.hashName(String(req.body.name)), {
						path: '/',
						httpOnly: true
					}))
				}
				res.redirect('/');
			} else {
				res.render('login', {
					'title': 'Log in again',
					'loggedInUser' : username,
					'error': "Password is incorrect"
				});
			}
		} else {
			console.log("Username not found in db")
			res.render('login', {
				'title': 'Log in again',
					'loggedInUser' : username,
				'error': "Username doesn't exist in database"
			});
		}
	});
});

//Sign up page
router.get('/signup', function(req, res){
	if(loggedIn){
		res.redirect('/');
	} else {
		var context = {
			'title': 'Sign up',
			'loggedInUser' : username
		};
		res.render('signup', context);
	}
});
router.post('/signup', function(req, res){
	var namey = req.body.name;
	var validUsername = check.validateUsername(namey);
	var validPassword = check.validatePassword(req.body.password);
	var validVerify = check.validateVerify(req.body.password, req.body.verify);
	var validEmail = check.validateEmail(req.body.email);

	// Check form input is valid.
	if (validUsername && validPassword && validVerify && validEmail) {
		//Check that username isn't already in the db
		mongoose.model('User').findOne({
			name: req.body.name
		}, function(err, user) {
			// If username is already in db, rerender page
			if (user) {
				console.log("User already exists in db");
				res.render('signup', {
					'title': 'Sign up',
					'loggedInUser' : username,
					'errorMessage': "Username is already taken"
				});
			} else {
				// If username not already in db, add new user to the database with a hashed password.
				mongoose.model('User').create({
					name: req.body.name,
					password: check.hashPassword(req.body.password)
				}, function(err, user) {
					if (err) {
						res.send("There was a problem adding this user to the database");
					} else {
						console.log("User - " + req.body.name + " - has been added to the db");
					};
				});

				// Set a new cookie with the name
				if (req.body.remember) {
					res.setHeader('Set-Cookie', cookie.serialize('name', check.hashName(String(namey)), {
						httpOnly: true,
						path: '/',
						maxAge: 60 * 60 * 24 * 7 // 1 week 
					}));
				} else {
					// don't set max age so only is session cookie.
					res.setHeader('Set-Cookie', cookie.serialize('name', check.hashName(String(namey)), {
						path: '/',
						httpOnly: true
					}))
				}
				res.redirect('/');
			}
		});
	} else {
		res.render('signup', {
					'title': 'Sign up',
					'loggedInUser' : username,
					'name': namey,
					'email': req.body.email,
					'errorMessageUsername': check.usernameErr,
					'errorMessagePassword': check.passwordErr,
					'errorMessageVerify': check.verifyErr,
					'errorMessageEmail': check.emailErr
				});
	}
});

//View user's information
router.get('/:id', function(req, res){
	res.redirect('/');
});

module.exports = router;