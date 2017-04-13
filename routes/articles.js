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
					'loggedInUser' : username,
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
			res.render('article_add', {
				'title': 'Add an article',
				'loggedInUser' : username 
			})
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
					'loggedInUser' : username,
					'errorMessage': "Article with that title already exists"
				});
			} else {
				// If article not already in db, add new article to the database.
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
				articleCreationDate = article.dateAdded.toDateString();
				articleContent = article.articleContent;
				res.render('article', {
					'title' : namey,
					'loggedInUser' : username,
					'articleName' : namey,
					'articleCreationDate' : articleCreationDate,
					'articleContent' : articleContent,
					'articleEdit' : req.id + "/edit",
					'articleHistory' : req.id + "/history"
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
		if(!loggedIn){
			res.send("Must be logged in to edit articles. Click <a href='/users/login'>here</a> to login.");
		} else {mongoose.model('Article').findOne({
			_id: req.id
		}, function(err, article) {
			// If article is in db, set 'namey' to name
			if (article) {
				var namey = article.name;
				var articleCreationDate = article.dateAdded.toDateString();
				var articleContent = article.articleContent;

				res.render('article_edit', {
					'title' : "Edit | " + namey,
					'loggedInUser' : username,
					'articleName' : namey,
					'articleContent' : articleContent,
					'articleVersion' : article.version,
					'articleDelete' : "delete"
				});
				} else {
					console.log("Article not found");
					res.redirect('/articles');
			}
		});
		}
		
	})
	//Save new content to article in database.
	//Update dateUpdated, version, editedBy, oldContent
	.post(function(req, res){
		mongoose.model('Article').findByIdAndUpdate(req.id, { $set: { 
			articleContent: req.body.article,
			 dateUpdated: Date.now(),
			 version: req.body.version += 1
		},
	$push: {
			editedBy: username,
			oldContent: req.body.article
		}}, { new: true }, function (err, article) {
  			if (err) return console.log(err);
  		res.send(article);
		});

	});

//Delete article and all its history etc
router.route('/:id/delete')
	.post(function(req, res){
		if(!loggedIn){
			res.send("Must be logged in to delete articles. Click <a href='/users/login'>here</a> to login.");
		} else {
		mongoose.model('Article').findById(req.id, function(err, article) {
					article.remove(function(err, article) {
							if (err) {
								return console.error(err);
							} else {
								//Returning success message saying it was deleted
								console.log('DELETE removing ID: ' + article._id);
								res.redirect('/');
								}
							});
					});
		}
	});

//View history of article
router.route('/:id/history')
	.get(function(req, res){
		res.send("Route working");
	});

//Delete an individual article
router.route('/:id/edit/delete')

	//Check user is logged in (and has permission?!) then delete article,
	// update db and cache and return to article list
	.post(function(req, res){
		//res.redirect('/articles');
		res.redirect('/');
	});

module.exports = router;