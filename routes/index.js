var express = require('express'),
    router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  var context = {
		'title': 'WikiGuy'
	};
	res.render('home', context);
});

module.exports = router;