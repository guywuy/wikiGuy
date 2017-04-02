var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wikiguydb');
 
var articleSchema = new mongoose.Schema({  
  name: String,
  articleContent: String,
  dateAdded: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
  version: Number, 
  oldContent: [String]
});

var userSchema = new mongoose.Schema({
	name: { type: String, unique: true },
	password: String,
	dateJoined: { type: Date, default: Date.now },
	email: String
});

// Model is what will be referenced throughout app.
mongoose.model('Article', articleSchema);
mongoose.model('User', userSchema);