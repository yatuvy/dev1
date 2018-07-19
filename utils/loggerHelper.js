// console.log('loggerHelper.js Start Up');
//loads Scribe
var scribe = require('scribe-js')({
    createDefaultConsole : false
});
var dateFormat = require('dateformat');

var config = {
  console : {colors : 'inverse'}
}
var logFolder = '../logs/WonderFlowLogs';
//don't pass a logWriter config, but a custom LogWriter instead
var myLogWriter = new scribe.LogWriter(logFolder);
process.console = scribe.console(config, myLogWriter);

module.exports = {
  initiateLogger: initiate,
  createLogMessage: createLogMessage
};

var msgColor = 'magenta'; //black red green yellow blue magenta cyan white gray grey
var tagJson = {msg : 'Logger', colors : [msgColor, 'inverse']};

function initiate(app){
  //Create getPath and getFilename methods to erase the default ones
  myLogWriter.getPath = function (opt) {
    return '../../logs';
  };
  var now = new Date();
  var formatText = dateFormat(now, "yyyy-mm-dd-h-MM-ss");
  myLogWriter.getFilename = function (opt) {
    console.log('loggerHelper.js myLogWriter.getFilename formatText = ' + formatText);
    return formatText + '.' + opt.logger.name + '.json';
  };
  app.use(scribe.express.logger()); //Log each request
  app.use('/logs', scribe.webPanel());

  process.console.tag(tagJson).time().file().log("Initiate Logger");
}

function createLogMessage(logPrefix, properties) {
  var logMessage = logPrefix;
  for (var key in properties) {
    var value = properties[key];
    logMessage += '\n\t' + key + ': ' + value;
  }
  return logMessage;
}

