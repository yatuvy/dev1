var console = process.console;
var tagJson = {msg : 'DOCUMENTS', colors : ['grey', 'inverse']};
console.tag(tagJson).time().file().log("documents.js Start Up");
var dbHelper = process.dbHelper;// Util for DB operations
var express = require('express');
var validationHelper = require('./validationHelper');
var management = require('./management');
var json2md = require("json2md");
var router = express.Router();

router.post('/generatedocumentmarkdown', validationHelper.validateSession, function (req, res) {
  tagJson = {msg : 'Generate Document Markdown', colors : ['green', 'inverse']}; //var user = req.session.user;
  var data = req.body;
  var userCriteria = req.session.userCriteria;
  var currentFlow = req.session.userCurrentFlow;
  var flowProgressPath = management.computeFlowProgressPath(currentFlow);
  console.tag(tagJson).time().file().info("Flow Progress Path: " + flowProgressPath + "\n\tData: " + JSON.stringify(data));
  var itemPath = (data.Path == null || data.Path == "") ? flowProgressPath : flowProgressPath + "." + data.Path;
  var projection = [itemPath];
  dbHelper.collectionFindOne('users', userCriteria, projection, function (flowProgressData) {
    var itemProgress = getTreeElement(flowProgressData, itemPath);
    var list;
    var header1;
    var blockquote = itemPath + "\nJSON converted to Markdown";
    if (Array.isArray(itemProgress)){
      header1 = data.Path;
      list = [
        { h1: header1 }
        , { blockquote: blockquote }
      ];
      for (var i in itemProgress){
        var element = itemProgress[i];
        list.push({h2: element.name});
        if (element.text != null) {
          list.push({ h3: "Text" });
          list.push({ ul: [element.text] });//        , { h2: "How to contribute" }//        , { ol: ["Fork the project", "Create your branch", "Raise a pull request"]}//        , { img: imageArray }
        }
        if (element.message != null) {
          list.push({ h3: "Message" });
          list.push({ ul: [element.message] });
        }
        if (element.imageDescription != null) {
          list.push({ h3: "Image Description" });
          list.push({ ul: [element.imageDescription] });
        }
      }
    }
    else{
      header1 = itemProgress.name;            //var imageArray = [        { title: "Some image", source: "https://example.com/some-image.png" }        , { title: "Another image", source: "https://example.com/some-image1.png" }    ];
      list = header1 == null ? [] : [{ h1: header1 }];
      list.push({ blockquote: blockquote });

      if (itemProgress.text != null) {
        list.push({ h3: "Text" });
        list.push({ ul: [itemProgress.text] });//        , { h2: "How to contribute" }//        , { ol: ["Fork the project", "Create your branch", "Raise a pull request"]}//        , { img: imageArray }
      }
      if (itemProgress.message != null) {
        list.push({ h3: "Message" });
        list.push({ ul: [itemProgress.message] });
      }
      if (itemProgress.imageDescription != null) {
        list.push({ h3: "Image Description" });
        list.push({ ul: [itemProgress.imageDescription] });
      }
    }

    console.tag(tagJson).time().file().log("Received " + JSON.stringify(itemProgress) +
      "\n\tlist: " + JSON.stringify(list));
    var json2mdText = json2md(list);
    console.tag(tagJson).time().file().log("\n\tjson2mdText: " + json2mdText);
    res.json({Text: json2mdText});
  });
});

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

module.exports = router;
