var express = require('express');
var router = express.Router();
var cookie = require('cookie');
var mongoose = require('mongoose');
var memcache = require('../memcache');

var check = require('../routes/validity');
var loggedIn = false;
var username;

 // route middleware that will happen on every request
router.use(function(req, res, next) {
    // Parse the cookies on the request 
	var cookies = cookie.parse(req.headers.cookie || '');

    loggedIn = check.loggedIn(cookies);
    if (cookies.name) username = cookies.name.split(":")[0];

    next(); 
});


/* GET home page. */
router.get('/', function(req, res, next) {
	//Check if memcache has keys. If it does, use two most recently updated, else request from the database.
	let twoArticles=[];
		//First two articles from memcache (should be sorted by dateUpdated...)
		if (memcache.getStats().keys>1){
			// Retreiving from cache
			for (var i = 0; i < 2; i++){
				twoArticles[i] = memcache.get(i);
			}
		} else {
			console.log("requesting from database");
		mongoose.model('Article').find({}).limit(2).sort({dateUpdated: -1}).exec(function(err, articles) {
			if (err) {
				return console.error(err);
			} else {
				for (article in articles){
					twoArticles.push(articles[article]);
				}
			}
		})
	}

  var context = {
		'title': 'WikiGuy',
		'loggedInUser' : username,
		'featuredArticles' : twoArticles,
		helpers: {
			firstLine: function(object) {
				var content = object.articleContent;
				return content.split(".")[0] + ".";

			}
		}
	};
	res.render('home', context);
});

router.get('/logout', function(req, res) {
	res.clearCookie('name');
	username='';
	res.redirect('/');
});

module.exports = router;