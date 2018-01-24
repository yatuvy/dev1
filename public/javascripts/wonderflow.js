var app = angular.module('wonderflow',
  ['ngResource', 'ngRoute', 'flowControllers']);
console.log("wonderflow.js angular.module('wonderflow')");

app.config(['$routeProvider', function($routeProvider){

  $routeProvider
    .when('/', {
      redirectTo: '/userflow'
    })
    .when('/userflow', {
      templateUrl: 'flows/userflow.html',
      controller: 'UserFlowCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

