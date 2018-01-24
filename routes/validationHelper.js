var console = process.console;
var tagJson = {msg : 'VALIDATION HELPER', colors : ['cyan', 'inverse']};
console.tag(tagJson).time().file().log("validationHelper.js Start Up");

module.exports = {
  validateSession: validateSession
};

function validateSession (req, res, next) {
  tagJson.msg = 'Validate Session';
  tagJson.colors[0] = 'cyan';
  var logger = console.tag(tagJson).time().file();
  var remoteAddress = req.connection.remoteAddress;
  var urlParams = getUrlParams(req);
  var errorMessage = "Missing User Criteria on Session";
  function errorLogMessage() {
    return "Request from " + remoteAddress + "\n\t" + errorMessage +
      "\n\t" + JSON.stringify(req.session) + "\n\turlParams: " + JSON.stringify(urlParams);
  }

  if (req.session && req.session.userCriteria) {
    logger.log('Request from %s. Session User: %s', remoteAddress, req.session.userCriteria.userEmail);
    next();
  } else {
    var hackuser = urlParams.hackuser == null ? validationProperties["statichackuser"] : urlParams.hackuser;
    if (hackuser == null) {
      logger.warning(errorLogMessage());
      res.json({Error: errorMessage}); // res.redirect('/#/login');
    } else {
      logger.warning(errorLogMessage() + '\n\t!!!!! Hack User: ' + hackuser + ' !!!!!');
      var criteria = {userEmail: hackuser};
      process.dbHelper.collectionFindOne('users', criteria, null, function (user) {
        if (user == null) {
          var errorMessage = "No user with criteria " + JSON.stringify(criteria);
          console.tag(tagJson).time().file().warning(errorMessage);
          res.json({Error: errorMessage}); // res.redirect('/#/login');
        }
        else {
          console.tag(tagJson).time().file().log("Found user %s", JSON.stringify(user));
          req.session.userCriteria = {userEmail: user.userEmail};
          req.session.userCurrentFlow = user.currentFlow;
          next();
        }
      });
    }
  }
};

function getUrlParams(req) {
  var q = req.url.split('?');
  var result = {};
  if (q.length >= 2) {
    q[1].split('&').forEach((item) => {
      try {
        result[item.split('=')[0]] = item.split('=')[1];
      }
      catch (exseption) {
        result[item.split('=')[0]] = '';
      }
    })
  }
  return result;
}
