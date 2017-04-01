var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wikiguydb');
 
var articleSchema = new mongoose.Schema({  
  name: String,
  articleContent: String,
  dateAdded: { type: Date, default: Date.now },
  dateUpdated: {type: Date, default: Date.now},
  history: {type: Object}
});
mongoose.model('wikiguy', articleSchema);