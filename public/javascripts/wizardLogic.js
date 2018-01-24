
console.log('wizardLogic.js Start Up');

var stack = new Array();

function addWizardState(pageData) {
  var flow = pageData.Flow;
  if (flow == null){
      console.log("No Flow found in " + toStringDisplay(pageData));
  }
  var flowProgress = pageData.FlowProgress;
  if (flowProgress == null){
    console.warn("No FlowProgress in received Data")
    flowProgress = {};
  }
  var wizardState = new WizardState (flow, flowProgress, pageData.FlowProgressDocuments);
  stack.push(wizardState);
  return wizardState;
}

function WizardState (FlowMetadata, FlowProgress, FlowProgressDocuments) {
  this.FlowProgress = FlowProgress;
  this.FlowProgressDocuments = FlowProgressDocuments;

  this.setItemPath = function (path) {
    this.itemPath = path
  };
  this.prepareScopeElements = function (scope) {prepareScopeElements.call(this, scope)};
  this.generateMarkdown = function (scope) {generateMarkdown.call(this, scope)};
}

function setWizardData(path, itemProgress, itemMetadata) {
    this.setItemPath(path);
    this.itemProgress = itemProgress; // The current built item progress
}

function prepareScopeElements(scope) {
  this.setItemPath(null);    //var lastPath = scope.progressConfiguration.lastPath;    //if (lastPath == null) {
  console.log("prepareScopeElements\n\tFlow Progress: " + JSON.stringify(this.FlowProgress));
  scope.progressConfiguration = this.FlowProgress._progressConfiguration;

  var lastPath = this.FlowProgress._configuration.LastPath;
  if (lastPath != null){
    //setElementOnScope.call(this, scope, lastPath);
    var progress = getTreeElement(this.FlowProgress, lastPath);
    var metadata = progress._configuration == null ? null : progress._configuration._itemMetadata;
    setWizardDataAndAttributes.call(this, lastPath, progress, metadata, scope);
  }
}

function setWizardDataAndAttributes(path, progress, metadata, scope) {
  setWizardData.call(this, path, progress, metadata);
}

function generateMarkdown(scope){
    generateDocumentMarkdown(this.itemPath, scope);
}
