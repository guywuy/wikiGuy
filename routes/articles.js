// Route handlers for list of articles and individual articles ( edit article, view history and delete)

var express = require('express');
var router = express.Router();
var cookie = require('cookie');
var mongoose = require('mongoose');
var memcache = require('../memcache');

var check = require('../routes/validity');
var loggedIn = false;
var username;

// route middleware that will happen on every request
router.use(function (req, res, next) {
    // Parse the cookies on the request 
    var cookies = cookie.parse(req.headers.cookie || '');
    //If there is a cookie for 'name', get the name (cookie is of form 'name:hash(secret + name)')
    if (cookies.name) username = cookies.name.split(":")[0];

    loggedIn = check.loggedIn(cookies);
    next();
});


/* GET /articles. */
router.route('/')
    //GET all articles
    .get(function (req, res, next) {

        //CHECK CACHE if it isn't empty, add contents to array and render page
        var numKeys = memcache.getStats().keys;
        if (numKeys > 0) {
            // Retreiving from cache
            let articlesFromCache = [];
            for (var i = 0; i < numKeys; i++) {
                articlesFromCache[i] = memcache.get(i);
            }
            res.render('articles_list', {
                'title': 'All articles',
                'loggedInUser': username,
                'article': articlesFromCache
            })
        } else {
            console.log("requesting from database");
            mongoose.model('Article').find({}).sort({
                dateUpdated: -1
            }).exec(function (err, articles) {
                if (err) {
                    return console.error(err);
                } else {
                    // //Add to memcache, as key->value pair of int->Article
                    for (article in articles) {
                        memcache.set(article, articles[article]);
                    }

                    console.log(memcache.keys());

                    res.render('articles_list', {
                        'title': 'All articles',
                        'loggedInUser': username,
                        'article': articles
                    })
                };
            });
        }
    })


//Add an article
router.route('/add')
    .get(function (req, res) {
        //if user is logged in, show form to submit article,
        // else show link to log in
        if (loggedIn) {
            res.render('article_add', {
                'title': 'Add an article',
                'loggedInUser': username
            })
        } else {
            res.redirect('/users/login');
        }
    })

//If post is valid (article doesn't already exist, has name and body) update cache and db, redirect to homepage
.post(function (req, res) {
    if (!loggedIn) {
        res.send('You must be logged in to add an article');
    } else {
        mongoose.model('Article').findOne({
            name: req.body.name
        }, function (err, article) {
            // If article is already in db, rerender page
            if (article) {
                console.log("Article already exists in db");
                res.render('article_add', {
                    'title': 'Add an article',
                    'loggedInUser': username,
                    'errorMessage': "Article with that title already exists"
                });
            } else {
                // If article not already in db, add new article to the database.
                mongoose.model('Article').create({
                    name: req.body.name,
                    articleContent: req.body.article,
                    version: 0,
                    dateUpdated: [Date.now()],
                    createdBy: username,
                    editedBy: [username],
                    oldContent: [req.body.article]
                });
                //Delete all cache so it has to regenerate
                memcache.flushAll();

                //redirect to homepage
                res.redirect('/');
            }
        });
    }
});

// route middleware to validate :id
router.param('id', function (req, res, next, id) {

    req.id = id;
    next();
});

//View an individual article
router.route('/:id')
    .get(function (req, res) {

        //Get name from database via ip and set as parameter
        mongoose.model('Article').findOne({
            _id: req.id
        }, function (err, article) {
            // If article is in db, set 'namey' to name
            // var updatedDate = 
            if (article) {
                res.render('article', {
                    'title': article.name,
                    'loggedInUser': username,
                    'articleName': article.name,
                    'articleCreationDate': article.dateAdded.toDateString(),
                    'articleUpdatedDate': article.dateUpdated[article.version].toDateString(),
                    'articleContent': article.articleContent,
                    'articleEdit': req.id + "/edit",
                    'articleHistory': req.id + "/history"
                });
            } else {
                console.log("Article not found");
                res.redirect('/articles');
            }
        });
    });

//Edit an individual article if logged in
router.route('/:id/edit')
    .get(function (req, res) {
        if (!loggedIn) {
            res.send("Must be logged in to edit articles. Click <a href='/users/login'>here</a> to login.");
        } else {
            mongoose.model('Article').findOne({
                _id: req.id
            }, function (err, article) {
                // If article is in db, set 'namey' to name
                if (article) {
                    res.render('article_edit', {
                        'title': "Edit | " + article.name,
                        'loggedInUser': username,
                        'articleName': article.name,
                        'articleContent': article.articleContent,
                        'articleVersion': article.version,
                        'articleDelete': "delete"
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
    .post(function (req, res) {
        let newVersion = parseInt(req.body.version, 10) + 1;
        mongoose.model('Article').findByIdAndUpdate(req.id, {
            $set: {
                articleContent: req.body.article,
                version: newVersion
            },
            $push: {
                editedBy: username,
                dateUpdated: Date.now(),
                oldContent: req.body.article
            }
        }, {
            new: true
        }, function (err, article) {
            if (err) return console.log(err);
        });
        //Delete all cache so it has to regenerate
        memcache.flushAll();

        res.redirect('/articles');
    });

//Delete article and all its history etc
router.route('/:id/delete')
    .post(function (req, res) {
        if (!loggedIn) {
            res.send("Must be logged in to delete articles. Click <a href='/users/login'>here</a> to login.");
        } else {
            mongoose.model('Article').findById(req.id, function (err, article) {
                article.remove(function (err, article) {
                    if (err) {
                        return console.error(err);
                    } else {
                        //Returning success message saying it was deleted
                        console.log('DELETE removing ID: ' + article._id);
                        res.redirect('/');
                    }
                });
            });
            //Delete all cache so it has to regenerate
            memcache.flushAll();
        }
    });

//View history of article
router.route('/:id/history')
    .get(function (req, res) {
        mongoose.model('Article').findById(req.id, function (err, article) {
            //Get latest version of article
            let latestVersion = parseInt(article.version, 10);

            //Get the requested version (from query parameter)
            let qVersion = parseInt(req.query.v, 10);
            //If there was no query parameter, or is an invalid version, use latestVersion
            if (!Number.isInteger(qVersion) || qVersion > latestVersion || qVersion < 0) {
                qVersion = latestVersion;
            };

            //Make array of numbers up to latest version to be set as options in template
            let vOptions = [];
            for (let i = 0; i <= latestVersion; i++) {
                vOptions.push(i);
            }
            let context = {
                'title': article.name + " | History",
                'loggedInUser': username,
                'articleName': article.name,
                'articleId': req.id,
                'version': vOptions,
                'articleContent': article.oldContent[qVersion],
                'articleVersion': qVersion,
                'editedBy': article.editedBy[qVersion],
                'articleUpdatedDate': article.dateUpdated[qVersion].toDateString(),
                helpers: {
                    selectedOpt: function (ver) {
                        if (ver == qVersion) {
                            return "selected";
                        }
                    }
                }
            }
            res.render('article_history', context);
        });
    });


module.exports = router;
