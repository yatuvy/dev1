var console = process.console;
var tagJson = {msg : 'FLOWS', colors : ['grey', 'inverse']};
function logger(tagJson) {return console.tag(tagJson).time().file();}
logger(tagJson).log("flows.js Start Up");

var router = require('express').Router();
module.exports = router;

var validationHelper = require('./validationHelper');
var dbHelper = process.dbHelper;// Util for DB operations
var dateFormat = require('dateformat');

router.post('/userstartflow', validationHelper.validateSession, function (req, res){
  var tagJson = {msg : 'User Start Flow', colors : ['green', 'inverse']};
  var currentFlow = req.session.userCurrentFlow;
  if (currentFlow == null){
    logger(tagJson).warning("Missing Current Flow");
    res.json({Error: "Missing Current Flow"});
    return;
  }
  logger(tagJson).log("Process User Flow " + JSON.stringify(currentFlow));
  var operationsHelper = dbHelper.dbOperationsHelper(res, tagJson, null,
    {depth: 1, stringLimit: 30, skipList: ["_progressConfiguration", "_configuration"]});

  var flowCriteriaHolder = {};
  operationsHelper.push({name: "Find Item", command: "findOne",
    collection: currentFlow.collection, selection: currentFlow.selection,
    updateCallback: function(progress) {
      if (progress._metadata == null) progress._metadata = {};
      progress._metadata.collection = currentFlow.collection;
      operationsHelper.answer.FlowProgress = progress;
      if (progress._metadata.parent != null) {
        flowCriteriaHolder.data = {name: progress._metadata.parent.name};
        var timestamp = progress._id.getTimestamp();
        operationsHelper.answer.FlowProgressTimestamp = timestamp;
        logger(tagJson).log("Found Document: " + (progress.name == null ? "" : progress.name + " ") + progress._id +
          "\tDB Timestamp: " + dateFormat(timestamp, "dd/mm/yyyy,hh:MM:ss"));
      }
    },
    nextChecker: function (progress, err) {
      if (err != null){
        logger(tagJson).warning("Failed to get current flow " + JSON.stringify(currentFlow));
        return null;
      }
      if (progress._metadata.parent == null){
        logger(tagJson).warning("!!! Document has no parent flow");
        return "last";
      }
    }
  });
  operationsHelper.push({name: "Get Flow Metadata", command: "findOne",
    collection: "flows", selectionGetter: function(){return flowCriteriaHolder.data},
    nextChecker: function(data, err) {
      if(err){
        logger(tagJson).warning("Failed getting metadata " + JSON.stringify(flowCriteriaHolder.data));
        return "next";
      }
    } ,
    answerAfterOperation:true, updateCallback: function(response) {
      if (response == null) {
        logger(tagJson).log("No " + currentFlow.name + " Flow found");
        operationsHelper.answer.Flow = flowCriteriaHolder.data;
      } else {
        logger(tagJson).log("Found Flow " + JSON.stringify(response));
        operationsHelper.answer.Flow = response;
      }
    }});
  operationsHelper.execute();
});

