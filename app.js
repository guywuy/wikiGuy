var express = require('express');
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
})); // support encoded bodies

// DB stuff
// var mongoose = require('mongoose');
// var db = require('./model/db');

// Template stuff
var exphbs = require('express-handlebars');
// Create instance so you can have access to full api, define helpers etc
var hbs = exphbs.create({
	defaultLayout: 'main',
	// Specify helpers which are only registered on this instance.
	helpers: {
	}
});

// Register `hbs.engine` with the Express app.
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


var index = require('./routes/index');
app.use('/', index);



app.listen(3000, function() {
	console.log('Listening on port 3000!');
});