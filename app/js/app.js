'use strict';

/* App Module */

var cacaoApp = angular.module('cacaoApp', [
    'ngRoute',
    'restangular',
    'ngMdIcons',
    'ngMaterial',
    'ui.gravatar',
    'ngStorage' // https://github.com/gsklee/ngStorage
]);

cacaoApp.config(['$routeProvider', 'RestangularProvider', '$httpProvider', '$mdThemingProvider', 'gravatarServiceProvider',
    function($routeProvider, RestangularProvider, $httpProvider, $mdThemingProvider, gravatarServiceProvider) {
        gravatarServiceProvider.defaults = {
          size     : 100,
          "default": 'mm'  // Mystery man as default for missing avatars
        };
        gravatarServiceProvider.secure = true;
        gravatarServiceProvider.protocol = 'my-protocol';
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('pink');
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
        RestangularProvider.setRequestSuffix('/');
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

// nav
cacaoApp.controller('NavCtrl', ['$scope', '$mdSidenav', '$localStorage',
    function ($scope, $mdSidenav, $localStorage) {
        $scope.toggleRight = buildToggler('right');
        function buildToggler(navID) {
            return function() {
                $mdSidenav(navID).toggle();
            }
        }
}]);

// log in
cacaoApp.controller('LoginCtrl', ['$scope', '$http', '$localStorage', '$location',
    function($scope, $http, $localStorage, $location) {
        $scope.userData = {'email':'elenimijalis@gmail.com'}
        $scope.saveData = function() {
            if ($scope.loginForm.$valid) {
                $http.post('http://localhost:8000/api-token-auth/', $scope.userData)
                    .success(function(data) {
                        $localStorage.jwtToken = data.token;
                        // $localStorage.jwtData = {username: "admin", user_id: 1, email: "user@host", exp: 1462137950}
                        $localStorage.jwtData = jwt_decode(data.token);
                        $scope.userData = $localStorage.jwtData;
                        $location.path('/');
                    })
                    .error(function() {
                    });
            }
            if ($scope.loginForm.$invalid) {
                 console.log("invalid");
            }
        };
}]);
