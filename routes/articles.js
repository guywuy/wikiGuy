// Route handlers for list of articles and individual articles ( edit article, view history and delete)

var express = require('express'),
    router = express.Router();

/* GET /articles. */
router.route('/')
	//GET all articles
	.get(function(req, res, next) {
		let articles = [];

  		var context = {
			'title': 'Articles',
			'article': articles
			};
		res.render('articleslist', context);
	})

	.post(function(req, res) {
	
	});

//Add an article
router.route('/add')
	.get(function(req, res){
		//if user is logged in, show form to submit article,
		// else show link to log in
		if (true){
			res.render('article_add', {'title': 'Add an article'})
		} else {
			res.redirect('/users/login');
		}
	})

	//If post is valid (article doesn't already exist, has name and body) update cache and db, redirect to homepage
	.post(function(req, res){
		if (true){
			res.redirect('/');
		}
	});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    // do validation on id here
    // blah blah validation
    // log something so we know its working
    console.log('doing id validations on ' + id);

    // once validation is done save the new item in the req
    req.id = id;
    // go to the next thing
    next(); 
});

//View an individual article
router.route('/:id')
	.get(function(req, res){
		console.log("From the get function, after the middleware, id is : " + req.id);
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