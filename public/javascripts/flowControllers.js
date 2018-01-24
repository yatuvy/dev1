
'use strict';

console.log("flowControllers.js Start Up");

var contentType = 'application/x-www-form-urlencoded';

var flowControllers = angular.module('flowControllers', []);

var hRecursiveDirective = function ($compile) {
  return {
    link: function (scope, elem, attrs, ctrl) {
      var key = scope.key;
      if (isNaN(key)){
        if (key == null || key == "" || (key.startsWith("_"))) {
          return;
        }
      }
      
      //var value = getDataValue(scope);
      //var valueString = JSON.stringify(value);
      //scope.elementPath = flowProgressMap[valueString];
      ctrl.transclude(scope, function (content) {
        elem.after(content);
      });
    },
    controller: function ($element, $transclude) {
      var elementParent = $element.parent();
      var parent = elementParent.controller('hRecursive');
      this.transclude = angular.isObject(parent)
        ? parent.transclude
        : $transclude;
    },
    priority: 500,  // ngInclude < hRecursive < ngIf < ngRepeat < ngSwitch
    require: 'hRecursive',
    terminal: true,
    transclude: 'element',
    $$tlb: true  // Hack: allow multiple transclusion (ngRepeat and ngIf)
  }
}

flowControllers.directive('hRecursive', hRecursiveDirective);

function onFailure(errorMessage) {
    console.warn(errorMessage)
    alert(errorMessage)
}

function userStartFlowRequest(scope) {
  sendPostRequest(scope, 'management', 'userstartflow', contentType, null, function (response) {
    var userData = response.data.UserData;
    console.log("userstartflow Success\n\tData: " + toDisplay(response.data, 1) +
      (userData == null ? "" : "\n\tUserData: " + JSON.stringify(userData)));
    prepareFromPageData(scope, response.data);
  }, function (response){
    onFailure(response.data.Error == null ? response.data : response.data.Error);
  });
}

function prepareFromPageData(scope, pageData) {
  if (pageData.Error == null) {
    var wizardState = addWizardState(pageData);
    scope.wizardState = wizardState;
    wizardState.prepareScopeElements(scope);
  } else {
    onFailure(pageData.Error);
  }
}

flowControllers.controller('UserFlowCtrl',
  ['$scope', '$resource', '$http', '$routeParams', '$location', '$sce',
  function($scope, $resource, $http, $routeParams, $location) {

    $scope.http = $http;
    $scope.location = $location;
    $scope.isObject = function (ob){return angular.isObject(ob)};
    $scope.isArray = function (ob){return Array.isArray(ob)};
    $scope.isNumber = function (ob){return !isNaN(ob)};

    $scope.generateMarkdown = function(){$scope.wizardState.generateMarkdown($scope)};
    $scope.generateMarkdownHtml = function () {
      var preview = document.getElementById("markdownPreview");
      preview.innerHTML = markdown.toHTML($scope.wizardState.itemProgressMarkdown);
    };

    userStartFlowRequest($scope);
  }]
);

function generateDocumentMarkdown(path, scope) {
    //var path = flow._path;
    console.log("Generate Document Markdown " + path);

    var contentType = 'application/json';
    sendPostRequest(scope, 'documents', 'generatedocumentmarkdown', contentType, {Path: path}, function (response) {//handlePageData(response.data, 'userFlow', function (data) {
        if (response.data.Error == null) {
            console.log("generateDocumentMarkdown Success " + path + "\nText: " + response.data.Text);
            scope.wizardState.itemProgressMarkdown = response.data.Text;
        } else {
            onFailure(response);
        }
    }, onFailure);
}

function getTreeElement(tree, path) {
    if (tree == null) return null;
  var element = tree;
  var pathArray = path.split(".");
  for (var i = 0; i < pathArray.length; i++) {
    var key = pathArray[i];
    element = element[key];
  }
  return element;
}

function toStringDisplay(ob) {
    return toDisplay(ob, 0);
}

function toDisplay(ob, depth) {
  function recursiveToDisplay(ob1, depth1) {
    var obDisplay = {};
    for (var key in ob1) {
      if (!key.startsWith("$$")){
        var value = ob1[key];
        obDisplay[key] = (typeof value) == "object" ? (depth1 < 1 ? "..." : recursiveToDisplay(value, depth1 - 1)) : value;
      }
    }
    return obDisplay;
  }

  var obDisplay = recursiveToDisplay(ob, depth);
  var ans = JSON.stringify(obDisplay);
  return ans;
}

