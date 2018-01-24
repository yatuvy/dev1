var tagJson = {msg : 'DB Helper', colors : ['magenta', 'inverse']};//yellow

// Import Monk, a persistence module over MongoDB. (like Mongoose)
var monk = require('monk');
// The Monk import returns a method that is used to get access to the database
var dbUri = dbProperties.uri;
var db = monk(dbUri);
process.console.tag(tagJson).time().file().log(
  "dbHelper.js Start Up, DB:\n\tDB Uri: " + dbUri + "\n\t" + JSON.stringify(db));

module.exports = {
  collectionFindOne: findOne
};

function findOne(dbName, criteria, projection, callback){
  tagJson.msg = 'DB Get Data';
  var criteriaString = JSON.stringify(criteria);
  var collection = db.get(dbName);
  process.console.tag(tagJson).time().file().log(
    'Find ' + criteriaString + (projection == null ? "" : ' : ' + JSON.stringify(projection)));

  collection.findOne(criteria, projection, function(err, data){
    if (err){
      process.console.tag(tagJson).time().file().warning("DB Find Error " + JSON.stringify(err));
      callback(null);
    }
    else if (data == null){
      var errorMessage = "Not found: " + criteriaString;
      process.console.tag(tagJson).time().file().warning(errorMessage);
      callback(null);
    }
    else {
      process.console.tag(tagJson).time().file().log(
        'Found in DB ' + dbName + ' criteria: ' + JSON.stringify(criteria) + ': ' + data['_id']);
      callback(data);      
    }
  });
}

