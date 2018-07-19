
console.log('httpHelper.js Start Up');

function sendApiRequest(scope, apiName, apiMethod, parameters, method, contentType, data, successCallback, failureCallback) {
    var location = scope.location;
    var http = scope.http;
    var urlPath = 'http://' + location.$$host + ':' + location.$$port + '/api/' + apiName + '/' + apiMethod;
    if (parameters != null) {
        urlPath += parameters;
    }
    var searchObject = scope.location.search();
    console.log("\nhttpHelper.js getFlowsRequest() " + method + " " + urlPath +
      "\n\tsearch: " + JSON.stringify(searchObject) +
      "\n\tdata: " + JSON.stringify(data));
    var req = {
        method: method,
        url: urlPath,
        headers: {
            'Content-Type': contentType
        }
    };
    if (data != null) {
        req.data = data;
    }
    http(req).then(function (response) {
        if (response.Error == null && (response.data == null || response.data.Error == null)){
            successCallback(response);
        }
        else{
            failureCallback(response.Error == null ? response.data : response.Error);
        }
    }, failureCallback);
}

function sendPostRequest(scope, apiName, apiMethod, contentType, data, successCallback, failureCallback) {
    sendApiRequest(scope, apiName, apiMethod, null, 'POST', contentType, data, successCallback, failureCallback);
}

function handlePageData(data, loginNext, handleData){
  handleData(data);
}

