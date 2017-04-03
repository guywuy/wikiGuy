// Route handlers for list of articles and individual articles ( edit article, view history and delete)

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
	//If there is a cookie for 'name', get the name (cookie is of form 'name:hash(secret + name)')
	if (cookies.name) username = cookies.name.split(":")[0];

    loggedIn = check.loggedIn(cookies);
    console.log("Logged in = " + loggedIn);

    next(); 
});


/* GET /articles. */
router.route('/')
	//GET all articles
	.get(function(req, res, next) {

		mongoose.model('Article').find({}).sort({dateUpdated: 1}).exec(function(err, articles) {
			if (err) {
				return console.error(err);
			} else {
				// //Add to memcache, as key->value pair of int->food object
				// for (food in foods){
				// 	memcache.set(food, foods[food]);
				// }
				// console.log(memcache.keys());
				// // console.log("Stats keys" + memcache.getStats().keys);

				res.render('articleslist', {
					'title': 'All articles',
					'article': articles
				})
			};
		});

	})


//Add an article
router.route('/add')
	.get(function(req, res){
		//if user is logged in, show form to submit article,
		// else show link to log in
		if (loggedIn){
			res.render('article_add', {'title': 'Add an article'})
		} else {
			res.redirect('/users/login');
		}
	})

	//If post is valid (article doesn't already exist, has name and body) update cache and db, redirect to homepage
	.post(function(req, res){
		if (!loggedIn){
			res.send('You must be logged in to add an article');
		} else {
			mongoose.model('Article').findOne({
			name: req.body.name
		}, function(err, article) {
			// If article is already in db, rerender page
			if (article) {
				console.log("Article already exists in db");
				res.render('article_add', {
					'title': 'Add an article',
					'errorMessage': "Article with that title already exists"
				});
			} else {
				// If username not already in db, add new user to the database with a hashed password.
				mongoose.model('Article').create({
					name: req.body.name,
					articleContent: req.body.article,
					version: 0,
					createdBy: username,
					editedBy: [username],
					oldContent: [req.body.article]
				});
				res.redirect('/articles');
			}
		});
		}
	});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    // do validation on id here
    // blah blah validation
    // log something so we know its working
    console.log('doing id validations on ' + id);

    req.id = id;

    // go to the next thing
    next(); 
});

//View an individual article
router.route('/:id')
	.get(function(req, res){
		//Get name from db via id and

		var namey;
		var articleCreationDate;
		var articleContent;

    //Get name from database via ip and set as parameter
    mongoose.model('Article').findOne({
			_id: req.id
		}, function(err, article) {
			// If article is in db, set 'namey' to name
			if (article) {
				namey = article.name;
				articleCreationDate = article.dateAdded;
				articleContent = article.articleContent;
				console.log("Found article in db");
				console.log("namey = " + namey);
				console.log(articleCreationDate);
				console.log(articleContent);
				res.render('article', {
					'title' : namey,
					'articleName' : namey,
					'articleCreationDate' : articleCreationDate,
					'articleContent' : articleContent
				});
				} else {
					console.log("Article not found");
					res.redirect('/articles');
			}
		});

		
	});

//Edit an individual article if logged in
router.route('/:id/edit')
	.get(function(req, res){

	});

//View history of article
router.route('/:id/history')
	.get(function(req, res){

	});

//Delete an individual article
router.route('/:id/delete')

	//Check user is logged in (and has permission?!) then delete article,
	// update db and cache and return to article list
	.post(function(req, res){
		//res.redirect('/articles');
		res.redirect('/');
	});

module.exports = router;