/**
 * Initializations
 */
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var path            = require('path');
var url             = require('url');

/**
 * Setup of constants (and initializations)
 */
var mongoClient     = require('mongodb').MongoClient;
var mongoConnection = 'mongodb://localhost:27017';
var mongoDbName     = 'sago_mini_test';
var mongoDb         = null;
var mongoConnected  = null;

/**
 * Tell express that we like to see JSON when we're getting POST (or similar) requests that ship a body
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9000;

/**
 * Setup a new router for API calls
 */
var router = express.Router();
/**
 * Middleware! Could be used for sanitization.
 * Mongo connection happens (although it could be moved out globally and always on).
 * I opted for a quick instantiation and closure so we don't leave a connection hanging for long periods of time.
 * I realize this might be un-necessary.
 */
router.use(function(req, res, next) {
    console.log('Activity log...');
    // Could have done some sanitization here but I don't think it's 100% necessary
    mongoClient.connect(mongoConnection, function (err, client) {
        if (err) {
            res.statusCode = 500;
            res.json({ message: 'Serious error' });
        } else {
            console.log('Successfully connected to MongoDB');
            mongoDb = client.db(mongoDbName).collection('bundle_data');
            mongoConnected = client;
            next();
        }
    });
});
/**
 * Default route with no path for API
 */
router.get('/', function(req, res) {
    res.json({ message: 'Sago Mini API' });
    mongoConnected.close();
});
/**
 * Should look for a bundle id and ship the data back to the client.
 */
router.route('/read').get(function (req, res) {
    // Parse the URL using the fancy shmancy query parser
    var parts = url.parse(req.url, true);
    // Get the query parameters
    var query = parts.query;
    // Make sure we got what we need
    if (!query.bundle_id) {
        res.statusCode = 400;
        res.statusCode = res.json({ message: 'You need a bundle id' });
    } else {
        // We lowercase the bundleid here because it might be annoying if someone is typing com.sagomini.Homeworkchallenge and it doesn't matter
        var bundleId = query.bundle_id.toLowerCase();
        mongoDb.find({ bundle_id: bundleId }).toArray(function (err, docs) {
            mongoConnected.close();
            if (err) {
                res.statusCode = 403;
                res.json({ message: 'Bundle not found' });
            } else {
                if (docs.length === 1) {
                    res.statusCode = 200;
                    res.json({ message: 'Found bundle!', bundle: docs[0] });
                } else {
                    res.statusCode = 403;
                    res.json({ message: 'Bundle not found' });
                }
            }
        });
    }
});
/**
 * Forces a build number for a bundle. But the build number must be greater than the existing build number.
 * Also, if the bundle doesn't exist, create it.
 */
router.route('/set').post(function (req, res) {
    if (!req.body.bundle_id) {
        res.statusCode = 400;
        res.statusCode = res.json({ message: 'You need a bundle id' });
    } else if (!req.body.new_build_number) {
        res.statusCode = 400;
        res.statusCode = res.json({ message: 'You need a build number' });
    } else {
        var bundleId = req.body.bundle_id.toLowerCase();
        var newBuildNumber = parseInt(req.body.new_build_number);
        mongoDb.find({ bundle_id: bundleId }).toArray(function (err, docs) {
            if (err) {
                mongoConnected.close();
                res.statusCode = 500;
                // Just a stupid way of id-ing errors in case you need to trace back here easily
                res.json({ message: 'Serious error [90]' });
            } else {
                if (docs.length === 1) {
                    var bundleData = docs[0];
                    if (newBuildNumber > bundleData.build_number) {
                        mongoDb.findOneAndUpdate(
                            { bundle_id: bundleId },
                            { $set: { build_number: newBuildNumber }},
                            { returnOriginal: false, upsert: true },
                            function (err, queryResponse) {
                                mongoConnected.close();
                                if (err) {
                                    res.statusCode = 500;
                                    res.json({ message: 'Serious error [37]' });
                                } else {
                                    res.statusCode = 200;
                                    if (queryResponse.lastErrorObject.updatedExisting) {
                                        res.json({ message: 'Bundle updated', bundle: queryResponse.value });
                                    } else {
                                        res.json({ message: 'Bundle created', bundle: queryResponse.value });
                                    }
                                }
                            });
                    } else {
                        mongoConnected.close();
                        res.statusCode = 400;
                        res.json({ message: 'New build number must be greater than existing (' + bundleData.build_number + ')', bundle: bundleData });
                    }
                } else {
                    mongoConnected.close();
                    res.statusCode = 500;
                    res.json({ message: 'Serious error [91]' });
                }
            }
        });
    }
});
/**
 * Simply increments the build number by 1 for a given bundle.
 * Also creates the bundle and sets it if it doesn't exist.
 */
router.route('/bump').post(function (req, res) {
    if (!req.body.bundle_id) {
        res.statusCode = 400;
        res.statusCode = res.json({ message: 'You need a bundle id' });
    } else {
        var bundleId = req.body.bundle_id.toLowerCase();
        mongoDb.findOneAndUpdate(
            { bundle_id: bundleId },
            { $inc: { build_number: +1 }},
            { returnOriginal: false, upsert: true },
            function (err, queryResponse) {
                mongoConnected.close();
                if (err) {
                    res.statusCode = 500;
                    res.json({ message: 'Serious error [72]' });
                } else {
                    res.statusCode = 200;
                    if (queryResponse.lastErrorObject.updatedExisting) {
                        res.json({ message: 'Bundle updated', bundle: queryResponse.value });
                    } else {
                        res.json({ message: 'Bundle created', bundle: queryResponse.value });
                    }
                }
            });
    }
});
app.use('/api', router);

app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(port);
console.log('Magic happens on port ' + port);