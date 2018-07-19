'use strict';
console.log("flowControllers.js Start Up");
var contentType = 'application/x-www-form-urlencoded';
var flowControllers = angular.module('flowControllers', []);
flowControllers.directive('hRecursive', function ($compile) {
  return {
    link: function (scope, elem, attrs, ctrl) {
      var key = scope.key;
      if (isNaN(key)){
        if (key == null || key == "" || (key.startsWith("_"))) {
          return;
        }
      }
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
});

/* The UserFlowCtrl controller prepares the page for showing
a Video, a message and a question for the user that he has to answer before
proceeding to the next page */
flowControllers.controller('UserFlowCtrl', ['$scope', '$resource', '$http', '$routeParams', '$location',
  function($scope, $resource, $http, $routeParams, $location) {
    $scope.http = $http;
    $scope.location = $location;

    // Methods used by html directives
    $scope.isShowElement = function (elementName) {
      return true;
    };
    $scope.isObject = function (ob){return angular.isObject(ob)};
    $scope.isArray = function (ob){return Array.isArray(ob)};
    $scope.isNumber = function (ob){return !isNaN(ob)};
    $scope.isDocument = function (ob) {
      var ans = ob._metadata != null && ob._metadata.type == "Document";
      return ans;
    };
    $scope.isUpperElement = function (ob){
      function getScopeDepth(scope) {return scope.$parent == null ? 0 : getScopeDepth(scope.$parent) + 1}
      var scopeDepth = getScopeDepth(this);
      if (scopeDepth == 3 || scopeDepth == 4){
        return true;
      }
      return false;
    };
    $scope.prepareLowerElementValue = function (value) {
      if (value == null){
        return "";
      }
      var limit = 100;
      if (value.length > limit){
        return value.substring(0, limit) + "...";
      }
      return value;
    };
    $scope.elementClicked = function(elementScope) {$scope.wizardState.elementClicked(elementScope); };
    // Markdown buttons
    $scope.generateMarkdown = function(){generateDocumentMarkdown($scope);};
    $scope.generateMarkdownHtml = function () {
      var preview = document.getElementById("markdownPreview");
      preview.innerHTML = markdown.toHTML($scope.wizardState.itemProgressMarkdown);
    };

    userStartFlowRequest($scope);
  }]
);

function userStartFlowRequest(scope) {
  sendPostRequest(scope, 'flows', 'userstartflow', contentType, null, function (response) {
    console.log("userstartflow Success\n\tData: " + JSON.stringify(response.data) +
      "\n\tFlowProgress DB Timestamp: " + response.data.FlowProgressTimestamp);
    handlePageData(response.data, 'flow', function (data) {
      prepareFromPageData(scope, data);
    });
  }, function (response){
    console.warn(JSON.stringify(response.data));
  });
}

function prepareFromPageData(scope, pageData) {
  if (pageData.Error == null) {
    if (pageData.FlowProgress._configuration == null) pageData.FlowProgress._configuration = {};
    var wizardState = addWizardState(pageData);
    scope.wizardState = wizardState;
    wizardState.prepareScopeElements(scope);
  } else {
    onFailure(null, pageData.Error);
  }
}

function generateDocumentMarkdown(scope) {
  var wizardState = scope.wizardState;
  var progress = getTreeElement(wizardState.FlowProgress, wizardState.itemPath);
  console.log("Generate Document Markdown " + progress._path);
  var contentType = 'application/json';
  sendPostRequest(scope, 'documents', 'generatedocumentmarkdown', contentType, {Path: progress._path},
    function (response) {
      if (response.data.Error == null) {
        console.log("generateDocumentMarkdown Success " + progress._path + "\nText: " + response.data.Text);
        scope.wizardState.itemProgressMarkdown = response.data.Text;
      } else {
        console.warn(response.data.Error);
      }
  }, function (response){
    console.warn(JSON.stringify(response.data));
  });
}

function getTreeElement(tree, path) {
  if (tree == null) return null;
  if (path == "") return tree;
  var element = tree;
  var pathArray = path.split(".");
  for (var i = 0; i < pathArray.length; i++) {
    var key = pathArray[i];
    element = element[key];
    if (element == null){
      return null;
    }
  }
  return element;
}
