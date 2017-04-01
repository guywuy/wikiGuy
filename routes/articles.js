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

	})

	.post(function(req, res){

	});

//View an individual article
router.route('/:id')
	.get(function(req, res){

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