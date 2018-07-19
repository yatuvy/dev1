var tagJson = {msg : 'VALIDATION HELPER', colors : ['cyan', 'inverse']};
function logger(tagJson) {return process.console.tag(tagJson).time().file();}
logger(tagJson).log("validationHelper.js Start Up");

module.exports = {
  validateSession: validateSession
};

function validateSession (req, res, next) {
  if (req.session.userCurrentFlow == null){
    logger(tagJson).log("Set Session userCurrentFlow to " + JSON.stringify(dbProperties.currentFlow));
    req.session.userCurrentFlow = dbProperties.currentFlow;
  }
  next();
};
