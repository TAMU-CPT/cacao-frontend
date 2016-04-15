'use strict';

/* App Module */

var cacaoApp = angular.module('cacaoApp', [
    'ngRoute',
    'restangular',
    'ngStorage' // is this right? https://github.com/gsklee/ngStorage
]);

cacaoApp.config(['$routeProvider', 'RestangularProvider', '$httpProvider',
    function($routeProvider, RestangularProvider, $httpProvider) {
        $routeProvider.
            when('/teams', {
                templateUrl: 'partials/team-list.html',
                controller: 'TeamListCtrl'
            }).
            when('/teams/:teamID', {
                templateUrl: 'partials/team-detail.html',
                controller: 'TeamDetailCtrl'
            }).
            when('/users', {
                templateUrl: 'partials/user-list.html',
                controller: 'UserListCtrl'
            }).
            when('/users/:userID', {
                templateUrl: 'partials/user-detail.html',
                controller: 'UserDetailCtrl'
            }).
            when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl'
            }).
            when('/', {
                templateUrl: 'partials/home.html'
            }).
            otherwise({
                redirectTo: '/'
            });
        RestangularProvider.setBaseUrl('http://localhost:8000/');
        RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            var extractedData;
            // .. to look for getList operations
            if (operation === "getList") {
            // .. and handle the data and meta data
                extractedData = data.results;
                extractedData.meta = {
                    'count': data.count,
                    'next': data.next,
                    'previous': data.previous
                }
            } else {
                extractedData = data;
            }
            return extractedData;
        });
        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
           return {
               'request': function (config) {
                   config.headers = config.headers || {};
                   if ($localStorage.jwtToken) {
                       config.headers.Authorization = 'JWT ' + $localStorage.jwtToken;
                   }
                   return config;
               },
               'responseError': function (response) {
                   console.log('Failed with', response.status, 'status');
                   if (response.status == 401 || response.status == 403 || response.status == 400) {
                       $location.path('/login');
                   }
                   return $q.reject(response);
               }
           };
        }]);
}]);

cacaoApp.controller('TeamListCtrl', ['$scope', 'Restangular',
    function($scope, Restangular) {
        Restangular.all('groups').getList().then(function(data) {
            $scope.teams = data;
        });
}]);

cacaoApp.controller('TeamDetailCtrl', ['$scope', '$routeParams', 'Restangular',
    function($scope, $routeParams, Restangular) {
        Restangular.one('groups', $routeParams.teamID).get().then(function(data) {
            $scope.team = data;
        });
}]);

cacaoApp.controller('UserListCtrl', ['$scope', 'Restangular',
    function($scope, Restangular) {
        Restangular.all('users').getList().then(function(data) {
            $scope.users = data;
        });
}]);

cacaoApp.controller('UserDetailCtrl', ['$scope', '$routeParams', 'Restangular',
    function($scope, $routeParams, Restangular) {
        Restangular.one('users', $routeParams.userID).get().then(function(data) {
            $scope.user = data;
        });
}]);

cacaoApp.controller('LoginCtrl', ['$scope', '$http', '$localStorage',
    function($scope, $http, $localStorage) {
        $scope.loginForm = {};
        $scope.saveData = function() {
            if ($scope.loginForm.$valid) {
                console.log($scope.loginForm);
                $http.post('http://localhost:8000/api-token-auth/', $scope.loginForm)
                    .success(function(data) {
                        $localStorage.jwtToken = data.token;
                    })
                    .error(function() {
                        $scope.loginForm = {};
                    });
            }
        };
}]);
