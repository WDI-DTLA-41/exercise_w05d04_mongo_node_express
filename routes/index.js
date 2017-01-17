var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:27017/TESTER';

/* GET home page. */
router.get('/', function(request, response, next) {
  // render the index.hbs template and replace {{title}} with 'MongoDB - Basics'
  response.render('index', {title: 'MongoDB - Basics'});
});

/* CREATE Data */
router.post('/insert', function(request, response, next) {
  var item = {
    title: request.body.title,
    content: request.body.content,
    author: request.body.author
  };

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('data').insertOne(item, function(err, result) {
      assert.equal(null, err);
      console.log('Item inserted');
      db.close();
    });
  });

  response.redirect('/');
});

/* READ Data */
router.get('/data', function(request, response, next) {
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var dataFromDB = db.collection('data').find()
    dataFromDB.forEach(function(doc){
      resultArray.push(doc);
    },
    function () {
      db.close();
      response.render('index', {items: resultArray});
    });
  });
});

/* DELETE Data */
router.post('/data/:delete/delete', function(request, response, next){
  mongo.connect(url, function(err, db){
    var id = request.body.delete;
    assert.equal(null, err);
    db.collection('data').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      console.log("Item deleted: " + id);
      db.close();
    });
  });
  response.redirect('/data');
});

/* Comments */
router.get('/comments', function(request, response, next){
  var newComments = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var results = db.collection('data').find({"_id": objectId(request.query.id)});
    results.forEach(function(ind, err){
      assert.equal(null, err);
      newComments.push(ind);
    }, function(){
      db.close();
      response.render('comments', {items: newComments, title: 'MongoDB - Comments'});
    });
  });
 });

/* UPDATE Comments*/
router.post('/comments/:addcomment', function(request, response, next){
var result = [];
result.push(request.body.comment);
mongo.connect(url, function(err, db){
  assert.equal(null, err);
  db.collection('data').updateOne({"_id": objectId(request.body.addcomment)}, {$set: {comment: result}});
  db.close();
  response.redirect('/comments?id=' + request.body.addcomment );
  });
});

module.exports = router;
