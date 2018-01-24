var express = require('express');
var console = process.console;
var msgColor = 'blue'; //black red green yellow blue magenta cyan white gray grey
var tagJson = {msg : 'MANAGEMENT', colors : [msgColor, 'inverse']};
console.tag(tagJson).time().file().log("management.js Start Up");

var router = express.Router();

var validationHelper = require('./validationHelper');

// Util for DB operations
var dbHelper = process.dbHelper;

function computeFlowProgressPath(currentFlow) {
  var flowProgressPath = currentFlow.owner == null ? "inProgress." + currentFlow.name :
    "inProgress._documents." + currentFlow.owner.name + "." + currentFlow.owner.ElementPath;
  return flowProgressPath;
}

function computeProjection(path, path1) {
  var projection = {};
  projection[path] = 1;
  if (path1 != null){
    projection[path1] = 1;
  }
  return projection;
}

function onFailure(res, err) {
  console.tag(tagJson).time().file().warning(err);
  if (res != null) res.json({Error: err});
}

router.post('/userstartflow', validationHelper.validateSession, function (req, res){
  tagJson = {msg : 'User Start Flow', colors : ['white', 'inverse']};
  var userCriteria = req.session.userCriteria;
  var currentFlow = req.session.userCurrentFlow;
  console.tag(tagJson).time().file().info("Process User Flow of " + userCriteria.userEmail +
    "\n\tCurrent Flow: " + JSON.stringify(currentFlow));
  var flowProgressPath = computeFlowProgressPath(currentFlow);
  var projection = /*[flowProgressPath, flowDocumentsPath]*/[flowProgressPath];
  dbHelper.collectionFindOne('users', userCriteria, projection, function (flowProgressData) {
    if(flowProgressData == null){
      onFailure(res, "Failed to get Flow Data of " + userCriteria.userEmail);
    }
    else{
      var flowProgress = getTreeElement(flowProgressData, flowProgressPath);
      var answer = {/*Flow: flow, */FlowProgress: flowProgress};
      console.tag(tagJson).time().file().info("Found Flow Progress: " + JSON.stringify(flowProgress) +
        "\n\t# Answer for " + userCriteria.userEmail + ": " + JSON.stringify(answer));
      res.json(answer);
    }
  });
});

function getTreeElement(tree, path) {
  if (tree == null){
    return null;
  }
  var element = tree;
  var pathArray = path.split(".");
  for (var i = 0; i < pathArray.length; i++) {
    var key = pathArray[i];
    element = element[key];
    if (element == null){
      console.tag(tagJson).time().file().warning("getTreeElement() No Element Found. path: " + path +
        "\n\ttree: " + JSON.stringify(tree));
      return null;
    }
  }
  return element;
}

module.exports = router;
module.exports["computeFlowProgressPath"] = computeFlowProgressPath;
module.exports["computeProjection"] = computeProjection;

