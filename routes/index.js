var express = require('express');
var router = express.Router();


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