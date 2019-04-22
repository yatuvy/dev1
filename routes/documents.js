var console = process.console;
var tagJson = {msg : 'DOCUMENTS', colors : ['grey', 'inverse']};
function logger(tagJson) {return console.tag(tagJson).time().file();}
logger(tagJson).log("documents.js Start Up");

var dbHelper = process.dbHelper;// Util for DB operations
var validationHelper = require('./validationHelper');
var json2md = require("json2md");

var router = require('express').Router();
module.exports = router;

router.post('/generatedocumentmarkdown', validationHelper.validateSession, function (req, res) {
  tagJson = {msg : 'Generate Document Markdown', colors : ['green', 'inverse']}; //var user = req.session.user;
  var data = req.body;
  var currentFlow = req.session.userCurrentFlow;
  logger(tagJson).log("Data: " + JSON.stringify(data) + "\tcurrentFlow: " + JSON.stringify(currentFlow));

  var operationsHelper = dbHelper.dbOperationsHelper(res, tagJson);
  var itemPath = data.Path;
  operationsHelper.push({name: "Find pDocument", command: "findOne",
    collection: currentFlow.collection, selection: currentFlow.selection, projection: itemPath,
    updateCallback: function(pDocument) {
      var itemProgress = getTreeElement(pDocument, itemPath);
      if (itemProgress == null){
        operationsHelper.answer.Error = "No Item Progress in path " + itemPath;
        logger(tagJson).warning(operationsHelper.answer.Error);
      }
      else {
        operationsHelper.answer.result = "Success";
        operationsHelper.answer.Text = generateJson2mdText(itemPath, itemProgress, data);
        logger(tagJson).log("Markdown Text:\n" + operationsHelper.answer.Text);
      }
    }});
  operationsHelper.execute();
});

function generateJson2mdText(itemPath, itemProgress, data) {
  var list;
  var header1;
  var blockquote = itemPath + "\nJSON converted to Markdown";
  if (Array.isArray(itemProgress)) {
    header1 = /*data.Path*/ "Generated Markdown";
    list = [
      {h1: header1}
      , {blockquote: blockquote}
    ];
    for (var i in itemProgress) {
      var element = itemProgress[i];
      list.push({h2: element.name});
      if (element.text != null) {
        //list.push({h3: "Text"});
        list.push({ul: [element.text]});//        , { h2: "How to contribute" }//        , { ol: ["Fork the project", "Create your branch", "Raise a pull request"]}//        , { img: imageArray }
      }
      if (element.message != null) {
        list.push({h3: "Message"});
        list.push({ul: [element.message]});
      }
      if (element.imageDescription != null) {
        list.push({h3: "Image Description"});
        list.push({ul: [element.imageDescription]});
      }
    }
  }
  else {
    header1 = itemProgress.name;            //var imageArray = [        { title: "Some image", source: "https://example.com/some-image.png" }        , { title: "Another image", source: "https://example.com/some-image1.png" }    ];
    list = header1 == null ? [] : [{h1: header1}];
    list.push({blockquote: blockquote});
    if (itemProgress.text != null) {
      list.push({h3: "Text"});
      list.push({ul: [itemProgress.text]});//        , { h2: "How to contribute" }//        , { ol: ["Fork the project", "Create your branch", "Raise a pull request"]}//        , { img: imageArray }
    }
    if (itemProgress.message != null) {
      list.push({h3: "Message"});
      list.push({ul: [itemProgress.message]});
    }
    if (itemProgress.imageDescription != null) {
      list.push({h3: "Image Description"});
      list.push({ul: [itemProgress.imageDescription]});
    }
  }
  console.tag(tagJson).time().file().log("Received " + JSON.stringify(itemProgress) +
    "\n\tlist: " + JSON.stringify(list));
  var json2mdText = json2md(list);
  return json2mdText;
}

function getTreeElement(tree, path) {
  if (tree == null) return null;
  var element = tree;
  var pathArray = path.split(".");
  for (var i = 0; i < pathArray.length; i++) {
    var key = pathArray[i];
    element = element[key];
    if (element == null) return null;
  }
  return element;
}
