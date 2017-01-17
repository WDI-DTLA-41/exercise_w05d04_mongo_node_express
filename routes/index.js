var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:27017/TESTER';

/* GET home page. */
router.get('/', function(req, res, next) {
  // render the index.hbs template and replace {{title}} with 'MongoDB - Basics'
  res.render('index', {title: 'MongoDB - Basics'});
});

/* CREATE Data */
router.post('/insert', function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('data').insertOne(item, function(err, result) {
      assert.equal(null, err);
      console.log('Item inserted');
      db.close();
    });
  });

  res.redirect('/');
});

/* READ Data */
router.get('/data', function(req, res, next) {
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var dataFromDB = db.collection('data').find()
    dataFromDB.forEach(function(doc){
      resultArray.push(doc);
    },
    function () {
      db.close();
      res.render('index', {items: resultArray});
    });
  });
});

/* DELETE Data */
router.post('/data/:delete/delete', function(req, res, next){
  mongo.connect(url, function(err, db){
    var id = req.body.delete;
    assert.equal(null, err);
    db.collection('data').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      console.log("Item deleted: " + id);
      db.close();
    });
  });
  res.redirect('/data');
});

/* Comments */
router.get('/comments', function(req, resp, next){
  var newComments = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var results = db.collection('data').find({"_id": objectId(req.query.id)});
    results.forEach(function(ind, err){
      assert.equal(null, err);
      newComments.push(ind);
    }, function(){
      db.close();
      resp.render('comments', {items: newComments, title: 'MongoDB - Comments'});
    });
  });
 });

/* UPDATE Comments*/
router.post('/comments/:addcomment', function(req, resp, next){
var result = [];
result.push(req.body.comment);
mongo.connect(url, function(err, db){
  assert.equal(null, err);
  db.collection('data').updateOne({"_id": objectId(req.body.addcomment)}, {$set: {comment: result}});
  db.close();
  resp.redirect('/comments?id=' + req.body.addcomment );
  });
});

module.exports = router;
