var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var path            = require('path');
var url             = require('url');

var mongoClient     = require('mongodb').MongoClient;
var mongoConnection = 'mongodb://localhost:27017';
var mongoDbName     = 'sago_mini_test';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9000;

var ddI = 2;
var defaultData = [
    {id: 0, bundle_id: 'com.sagomini.HomeworkChallenge', build_number: 1},
    {id: 1, bundle_id: 'com.sagomini.SpiroChallenge', build_number: 1},
    {id: 2, bundle_id: 'test', build_number: 1}
];

var router = express.Router();
router.use(function(req, res, next) {
    console.log('Activity log...');
    next();
});
router.get('/', function(req, res) {
    res.json({ message: 'Sago Mini API' });
});
router.route('/read').get(function (req, res) {
    var parts = url.parse(req.url, true);
    var query = parts.query;
    var bundleId = query.bundle_id.toLowerCase();
    for (var i = 0; i < defaultData.length; ++i) {
        var bundleData = defaultData[i];
        if (bundleData.bundle_id.toLowerCase() === bundleId) {
            res.statusCode = 200;
            res.json({ message: 'Found bundle!', data: bundleData });
            break;
        }
    }
    res.statusCode = 403;
    res.json({ message: 'Bundle not found' });
});
router.route('/set').post(function (req, res) {
    var bundleId = req.body.bundle_id.toLowerCase();
    var newBuildNumber = parseInt(req.body.new_build_number);
    var exists = false;
    for (var i = 0; i < defaultData.length; ++i) {
        if (defaultData[i].bundle_id.toLowerCase() === bundleId) {
            var bundleData = defaultData[i];
            exists = true;
            if (newBuildNumber > bundleData.build_number) {
                bundleData.build_number = newBuildNumber;
                res.statusCode = 200;
                res.json({ message: 'Bundle updated', data: bundleData});
            } else {
                res.statusCode = 400;
                res.json({ message: 'New build number must be greater than existing', data: bundleData });
            }
            break;
        }
    }
    if (!exists) {
        defaultData.push({
            id: ddI,
            bundle_id: bundleId,
            build_number: 0
        });
        var data = defaultData[ddI];
        ++ddI;
        res.statusCode = 200;
        res.json({ message: 'Bundle created', data: data });
    }
});
router.route('/bump').post(function (req, res) {
    var bundleId = req.body.bundle_id.toLowerCase();
    var exists = false;
    for (var i = 0; i < defaultData.length; ++i) {
        if (defaultData[i].bundle_id.toLowerCase() === bundleId) {
            var bundleData = defaultData[i];
            exists = true;
            ++bundleData.build_number;
            res.statusCode = 200;
            res.json({ message: 'Bundle updated', data: bundleData });
            break;
        }
    }
    if (!exists) {
        defaultData.push({
            id: ddI,
            bundle_id: bundleId,
            build_number: 0
        });
        var data = defaultData[ddI];
        ++ddI;
        res.statusCode = 200;
        res.json({ message: 'Bundle created', data: data });
    }
});
app.use('/api', router);

app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(port);
console.log('Magic happens on port ' + port);