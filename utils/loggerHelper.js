// console.log('loggerHelper.js Start Up');
//loads Scribe
var scribe = require('scribe-js')({
    createDefaultConsole : false
});
var dateFormat = require('dateformat');

var config = {
  console : {colors : 'inverse'}
}
var logFolder = '../logs/Dev1Logs';
//don't pass a logWriter config, but a custom LogWriter instead
var myLogWriter = new scribe.LogWriter(logFolder);
process.console = scribe.console(config, myLogWriter);

module.exports = {
  initiateLogger: initiate
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
  //testLogger();
  // var logger = require('morgan');
  // app.use(logger('dev'));

  process.console.tag(tagJson).time().file().log("Initiate Logger");
}

function testLogger() {

  // var scribeConsole = process.console;
  scribeConsole.log("log Hello World!");// With log(...)
  scribeConsole.info("info Hello World!");// Now with other pipes
  scribeConsole.error("error Hello World!");
  scribeConsole.warning("warning Hello World!");
  // Now with an Object
  scribeConsole.log({
    hello : "world"
  });
  //Now with context
  scribeConsole.tag("Demo").time().file().log("context Hello world");

  scribeConsole.addLogger('fun', ['rainbow', 'inverse'], {
    timeColors : ['gray', 'underline']
  });
  scribeConsole.fun('something');

  scribeConsole.on('new', function (log, loggerName) {
    var loca = log.context.location;
    console.log('//Oh! ' + loggerName + ' has logged ' + log.message + ' from ' + loca.filename + ' ' + loca.line);
  });
}