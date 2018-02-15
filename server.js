/**
 * Initializations
 */
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var path            = require('path');
var url             = require('url');
var eventEmitter    = require('events');

/**
 * Simple Mongo class just so things are a bit more organized
 */
var mongoClass = {
    emitter: new eventEmitter(),
    mc: require('mongodb').MongoClient,
    connectionUrl: 'mongodb://localhost:27017', // Could put into a config json file and load it up
    dbName: 'sago_mini_test', //  Could put into a config json file and load it up
    db: null,
    connection: null,
    connect: function () {
        this.mc.connect(this.connectionUrl, function (err, client) {
            if (err) {
                mongoClass.emitter.emit('Connection error');
            } else {
                mongoClass.db = client.db(mongoDbName).collection('bundle_data');
                mongoClass.connection = client;
                mongoClass.emitter.emit('Connected');
            }
        });
    },
    findBundle: function (bundleId) {
        this.db.find({ bundle_id: bundleId }).toArray(function (err, docs) {
            if (err) {
                mongoClass.emitter.emit('Query Error', err);
            } else {
                if (docs.length === 1) {
                    mongoClass.emitter.emit('Found Bundle', docs[0]);
                } else {
                    mongoClass.emitter.emit('Bad Query Results');
                }
            }
        });
    },
    findBundleAndUpdate: function (bundleId, updateData, res) {
        mongoClass.db.findOneAndUpdate(
            { bundle_id: bundleId },
            updateData,
            { returnOriginal: false, upsert: true },
            function (err, queryResponse) {
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
    }
}

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
 */
router.use(function(req, res, next) {
    console.log('Activity log...');
    // Could have done some sanitization here but I don't think it's 100% necessary
    next();
});
/**
 * Default route with no path for API
 */
router.get('/', function(req, res) {
    res.json({ message: 'Sago Mini API' });
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
        // Demonstrating how you *might* use emitters. Doesn't really work too well because you have to keep track of multiple clients and event listeners per client
        // As an alternative, you could track clients, put event emitters on those clients, then make the mongoClass call those event emitters
        mongoClass.emitter.once('Query Error', function (error) {
            console.log('Query error', error);
            // I didn't think it was appropriate to show the client (ship to the client) the actual query errors
            res.statusCode = 403;
            res.json({ message: 'Bundle not found' });
        });
        mongoClass.emitter.once('Bad Query Results', function () {
            res.statusCode = 403;
            res.json({ message: 'Bundle not found' });
        });
        mongoClass.emitter.once('Found Bundle', function (bundle) {
            res.statusCode = 200;
            res.json({ message: 'Found bundle!', bundle: bundle });
        });
        // We lowercase the bundleid here because it might be annoying if someone is typing com.sagomini.Homeworkchallenge and it doesn't matter
        mongoClass.findBundle(query.bundle_id.toLowerCase());
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
        mongoClass.db.find({ bundle_id: bundleId }).toArray(function (err, docs) {
            if (err) {
                res.statusCode = 500;
                // Just a stupid way of id-ing errors in case you need to trace back here easily
                res.json({ message: 'Serious error [90]' });
            } else {
                if (docs.length === 1) {
                    var bundleData = docs[0];
                    if (newBuildNumber > bundleData.build_number) {
                        mongoClass.findBundleAndUpdate(bundleId, { $set: { build_number: newBuildNumber }}, res);
                    } else {
                        res.statusCode = 400;
                        res.json({ message: 'New build number must be greater than existing (' + bundleData.build_number + ')', bundle: bundleData });
                    }
                } else {
                    res.statusCode = 500;
                    res.json({ message: 'Serious error [91]' });
                }
            }
        });
    }
});
/**
 * Simply increments the build number by 1 for a given bundle.
 * Also creates the bundle and sets it if it doesn't.
 */
router.route('/bump').post(function (req, res) {
    if (!req.body.bundle_id) {
        res.statusCode = 400;
        res.statusCode = res.json({ message: 'You need a bundle id' });
    } else {
        var bundleId = req.body.bundle_id.toLowerCase();
        mongoClass.findBundleAndUpdate(bundleId, { $inc: { build_number: +1 }}, res);
    }
});
app.use('/api', router);

app.use('/', express.static(path.join(__dirname, 'public')));

/**
 * First connect to Mongo. Listen to emitters and then carry on.
 */
mongoClass.emitter.once('Connected', function () {
    app.listen(port);
    console.log('Magic happens on port ' + port);
});
mongoClass.emitter.once('Connection Error', function () {
    throw 'Need MongoDB Connection!';
});
mongoClass.connect();