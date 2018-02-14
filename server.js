var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var path            = require('path');
var url             = require('url');

var mongoClient     = require('mongodb').MongoClient;
var mongoConnection = 'mongodb://localhost:27017';
var mongoDbName     = 'sago_mini_test';
var mongoDb         = null;
var mongoConnected  = null;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9000;

var router = express.Router();
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
router.get('/', function(req, res) {
    res.json({ message: 'Sago Mini API' });
    mongoConnected.close();
});
router.route('/read').get(function (req, res) {
    var parts = url.parse(req.url, true);
    var query = parts.query;
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
});
router.route('/set').post(function (req, res) {
    var bundleId = req.body.bundle_id.toLowerCase();
    var newBuildNumber = parseInt(req.body.new_build_number);
    mongoDb.find({ bundle_id: bundleId }).toArray(function (err, docs) {
        if (err) {
            mongoConnected.close();
            res.statusCode = 500;
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
                                console.log(queryResponse);
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
});
router.route('/bump').post(function (req, res) {
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
                console.log(queryResponse);
                res.statusCode = 200;
                if (queryResponse.lastErrorObject.updatedExisting) {
                    res.json({ message: 'Bundle updated', bundle: queryResponse.value });
                } else {
                    res.json({ message: 'Bundle created', bundle: queryResponse.value });
                }
            }
        });
});
app.use('/api', router);

app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(port);
console.log('Magic happens on port ' + port);