var tagJson = {msg : 'DB Helper', colors : ['magenta', 'inverse']};//yellow
function logger(tagJson) {return process.console.tag(tagJson).time().file();}

// Import Monk, a persistence module over MongoDB. (like Mongoose)
var monk = require('monk');

// The Monk import returns a method that is used to get access to the database
var dbUri = dbProperties.uri;
var db = monk(dbUri);
logger(tagJson).log("dbHelper.js Start Up, DB:\n\tDB Uri: " + dbUri + "\n\t" + JSON.stringify(db));

module.exports = {
  dbOperationsHelper: dbOperationsHelper,
};

function dbOperations(operations, failureCallback, successCallback, index, displayConfiguration) {
  var tagJson = {msg : 'DB Helper', colors : ['yellow', 'inverse']};//yellow
  if (index == null){
    index = 0;
  }
  //process.console.tag(tagJson).time().file().log("index:" + index + " operations: " + JSON.stringify(operations));
  if (index >= operations.length){
    successCallback();
  }
  else {
    var operation = operations[index];
    var selection = operation.selectionGetter == null ? operation.selection : operation.selectionGetter();
    var updateValues = operation.updateValuesGetter == null ? operation.updateValues : operation.updateValuesGetter();
    var insertValue = operation.insertValueGetter == null ? operation.insertValue : operation.insertValueGetter();
    function displayText(ob, label, toDisplayFlag) {
      return (ob == null ? "" : " " + label + ":" +
        (toDisplayFlag ? JSON.stringify(ob) : JSON.stringify(ob)));
    }
    logger(tagJson).log("OPERATION: " + operation.name + ", " +
      operation.collection + ":" + operation.command +
      displayText(selection, "selection") +
      displayText(operation.projection, "projection") +
      displayText(updateValues, "updateValues", true) +
      displayText(insertValue, "insertValue", true));
    function successUpdate(data, data1) {
      if (operation.errorChecker != null){
        var errorMessage = operation.errorChecker(data, data1);
        if (errorMessage != null){
          failureCallback(errorMessage);
          return;
        }
      }
      if (operation.updateCallback != null){
        operation.updateCallback(data, data1);
      }
      if (operation.answerAfterOperation){
        logger(tagJson).warning("!!! answerAfterOperation is true. Send Answer now !!!");
        successCallback();
      }
      var nextIndex = index + 1;
      if (operation.nextChecker != null){
        var checkNext = operation.nextChecker(data);
        if (checkNext == "last"){
          nextIndex = operations.length - 1;
        }
        if (checkNext == "finish"){
          nextIndex = operations.length;
        }
        console.assert(index < nextIndex, "index:" + index + " nextIndex:" + nextIndex);
      }
      dbOperations(operations, failureCallback, successCallback, nextIndex, displayConfiguration);
    }
    function failedUpdate(err) {
      process.console.tag(tagJson).time().file().warning(err);
      if (operation.nextChecker != null){
        var checkNext = operation.nextChecker(null, err);
        if (checkNext == "next"){
          var nextIndex = index + 1;
          dbOperations(operations, failureCallback, successCallback, nextIndex);
          return;
        }
      }
      failureCallback(err);
    }
    switch (operation.command){
      case "find":
        find(operation.collection, selection, operation.projection, successUpdate, failedUpdate);
        break;
      case "findOne":
        findOne(operation.collection, selection, operation.projection, successUpdate, failedUpdate, displayConfiguration);
        break;
      default:
        var err = "Unexpected command " + operation.command;
        process.console.tag(tagJson).time().file().warning(err);
        failureCallback(err);
    }
  }
}

function dbOperationsHelper(res, tagJson, operations, displayConfiguration) {

  var answer = {};
  var answerSent = false;
  function successCallback() {
    if (res == null){
      logger(tagJson).log("No res to send Answer");
    }
    else if (answerSent){
      logger(tagJson).log("Already Sent Answer");
    }
    else{
      logger(tagJson).log("Answer: " + JSON.stringify(answer));
      res.json(answer);
      answerSent = true;
    }
  }
  function failureCallback(err) {
    if (res == null){
      logger(tagJson).warning("Error: " + err + ". No res to send Error");
    }
    else {
      logger(tagJson).warning("Error: " + err);
      res.json({Error: err});
    }
    //throw new Error("Where am I");
  }
  if (operations == null) operations = [];
  function push(operation) {
    operations.push(operation);
  }
  return {
    answer:answer,
    successCallback: successCallback,
    failureCallback: failureCallback,
    push: push,
    execute: function() {
      dbOperations(operations, failureCallback, successCallback, 0, displayConfiguration);
    }
  };
}

function find(dbName, criteria, projection, callback){
  var tagJson = {msg : 'DB Find', colors : ['magenta', 'inverse']};
  var collection = db.get(dbName);
  criteria = criteria == null ? {} : criteria;
  projection = projection == null ? {} : projection;
  //logger(tagJson).log('Find ' + dbName + ' criteria:' + JSON.stringify(criteria) + ' projection:' + JSON.stringify(projection));
  collection.find(criteria, projection, function(err, data){
    if (err) throw err;
    process.console.tag(tagJson).time().file().log(dbName + ' DB Found: ' + JSON.stringify(data));
    callback(data);
  });
}

function findOne(dbName, criteria, projection, callback, failureCallback, displayConfiguration){

  if (criteria == null){
    throw new Error("Missing Criteria for findOne operation");
  }
  tagJson.msg = 'DB Find One';
  var criteriaString = JSON.stringify(criteria);
  var collection = db.get(dbName);
  /*process.console.tag(tagJson).time().file().log(
    dbName + ' FIND ONE ' + criteriaString + (projection == null ? "" : ' : ' + JSON.stringify(projection)));*/

  var callbackFunction = function(err, data){
    //process.console.tag(tagJson).time().file().info("err: " + err + " data: " + data);
    var errorMessage;
    if (err){
      errorMessage = "DB Find Error " + JSON.stringify(err);
    }
    else if (data == null){
      errorMessage = "Not found: " + criteriaString;
    }

    if (errorMessage == null) {
      process.console.tag(tagJson).time().file().log('Found in DB ' + dbName + ': ' +
        JSON.stringify(data)
      );
      callback(data);
    } else {
      process.console.tag(tagJson).time().file().warning(errorMessage);
      if (failureCallback == null) {
        callback(null); //throw err;
      }
      else {
        failureCallback(errorMessage);
      }
    }
  };
  collection.findOne(criteria, projection, callbackFunction);
}
