
console.log('wizardLogic.js Start Up');

function addWizardState(pageData) {
  var flow = pageData.Flow;
  if (flow == null){
    console.log("No Flow found in " + JSON.stringify(pageData));
  }
  var flowProgress = pageData.FlowProgress;
  if (flowProgress == null){
    console.warn("No FlowProgress in received Data");
    flowProgress = {};
  }
  var wizardState = new WizardState (flow, flowProgress, pageData.FlowProgressDocuments);
  return wizardState;
}

function mapObjectElementsPath(ob, path) {
  if (!angular.isObject(ob)){
    return;
  }
  if (path.startsWith(".")){
    path = path.substring(1);
  }
  ob._path = path;
  for (var key in ob){
    var value = ob[key];
    var valuePath = path == "" ? key : path + "." + key;
    if (Array.isArray(value)) {
      value._path = valuePath;
      var index = 0;
      for (var item in value){
        var itemPath = valuePath + "." + index;
        var itemValue = value[item];
        mapObjectElementsPath(itemValue, itemPath);
        index++;
      }
    }
    else if (angular.isObject(value)) {
      mapObjectElementsPath(value, valuePath);
    }
  }
}

function WizardState(FlowMetadata, FlowProgress, FlowProgressDocuments) {
  this.FlowMetadata = FlowMetadata;
  this.FlowProgress = FlowProgress;
  this.FlowProgressDocuments = FlowProgressDocuments;

  this.prepareScopeElements = function (scope) {
    mapObjectElementsPath(this.FlowProgress, "");
    mapObjectElementsPath(this.FlowMetadata, "");
    var name = this.FlowProgress.name == null ? this.FlowProgress._id : this.FlowProgress.name;
    console.log("Prepare Scope Elements of " + name + " " + JSON.stringify(this.FlowProgress._metadata));
    var lastPath = this.FlowProgress._configuration.LastPath;
    if (lastPath == null){
      console.warn("LastPath not set");
      alert("LastPath not set");
    }
    else {
      prepareFromLastPath.call(this, lastPath, scope); 
    }
  };
  this.elementClicked = function (elementScope) {elementClicked.call(this, elementScope)};
}

function setWizardData(path, scope) {
  if (path.startsWith(".")) {
      path = path.substring(1);
  }
  this.itemPath = path;
  this.itemProgress = getTreeElement(this.FlowProgress, path);
}

function prepareFromLastPath(lastPath, scope) {
  console.log("Prepare from lastPath " + lastPath);
  var progress = getTreeElement(this.FlowProgress, lastPath);
  if (Array.isArray(progress)) {
    setWizardData.call(this, lastPath, scope);
  }
}

function elementClicked(elementScope) {
  var itemProgress = this.itemPath == null ? this.FlowProgress: getTreeElement(this.FlowProgress, this.itemPath);
  var valueObject = getValueObject.call(this, elementScope, itemProgress);
  setWizardData.call(this, valueObject._path, elementScope);
  console.log("elementClicked() " + valueObject._path);
}

function getValueObject(scope, defaultValue) {
  if (scope == null) {
    return defaultValue;
  }
  if (scope.value != null && angular.isObject(scope.value)) {
    return scope.value;
  }
  if (scope.$parent != null && scope.$parent.item != null) return scope.$parent.item;
  return getValueObject(scope.$parent, defaultValue);
}
