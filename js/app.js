window._ = require('lodash');
require('angular');
require('angular-route');
require('restangular');
require('angular-resource');
require('angular-material');
require('angular-material-icons');
require('angular-aria');
require('angular-gravatar');
require('angular-material-data-table');
require('angular-messages');
require('angular-animate');
require('jquery');
require('ngstorage');
require('angular-jwt');
require('ns-popover');
require('lightbox2');
var moment = require('moment');
/* App Module */

var cacaoApp = angular.module('cacaoApp', [
    'ngRoute',
    'restangular',
    'ngMdIcons',
    'ngMaterial',
    'ui.gravatar',
    'ngMessages',
    'ngAnimate',
    'md.data.table',
    'nsPopover',
    'ngStorage' // https://github.com/gsklee/ngStorage
]);

cacaoApp.config(['$routeProvider', '$httpProvider', '$mdThemingProvider', 'gravatarServiceProvider',
    function($routeProvider, $httpProvider, $mdThemingProvider, gravatarServiceProvider) {
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
            when('/gaf/create/:taxon?/:gene?', {
                templateUrl: 'partials/gaf.html',
                controller: 'GAFCtrl',
                reloadOnSearch: false
            }).
            when('/gaf/list', {
                templateUrl: 'partials/gaf-list.html',
                controller: 'GAFListCtrl'
            }).
            when('/gaf/:gafID', {
                templateUrl: 'partials/gaf-detail.html',
                controller: 'GAFDetailCtrl'
            }).
            when('/pmid/:PMID', {
                templateUrl: 'partials/pmid.html',
                controller: 'PMIDDetailCtrl'
            }).
            when('/goid/:GOID', {
                templateUrl: 'partials/goid.html',
                controller: 'GOIDDetailCtrl'
            }).
            when('/review', {
                templateUrl: 'partials/review.html',
                controller: 'ReviewCtrl',
                resolve: {
                    loginRequired: loginRequired
                }
            }).
            when('/test', {
                templateUrl: 'partials/test.html',
                controller: 'TestCtrl'
            }).
            when('/logout', {
                templateUrl: 'partials/login.html',
                controller: 'LogOutCtrl'
            }).
            when('/notifications', {
                templateUrl: 'partials/notifications.html',
                controller: 'NotificationCtrl'
            }).
            when('/', {
                templateUrl: 'partials/home.html',
                controller: 'HomeCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });

            function loginRequired($q, $location, $localStorage) {
                var deferred = $q.defer();
                if ($localStorage.jwtToken) {
                    deferred.resolve();
                } else {
                    $location.path('/login');
                }
                return deferred.promise;
            };

        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
            return {
               'request': function (config) {
                   // ignore if request is to GO backend
                   if (config.url.startsWith('https://cpt.tamu.edu/onto_api/')) {
                       return config;
                   }

                   config.headers = config.headers || {};
                   if ($localStorage.jwtToken) {
                       config.headers.Authorization = 'JWT ' + $localStorage.jwtToken;
                   }
                   return config;
               },
               'responseError': function (response) {
                   console.log('Failed with', response.status, 'status');
                   if (response.status == 401 || response.status == 403 || response.status == 400 || response.status == 500) {
                       console.log('bad');
                       //$location.path('/login');
                   }
                   return $q.reject(response);
               }
           };
        }]);
}]);

cacaoApp.controller('TestCtrl', ['$scope', 'CacaoBackend', '$filter', '$mdDialog',
    function($scope, CacaoBackend, $filter, $mdDialog) {
        $scope.showPrerenderedDialog = function(ev) {
            $mdDialog.show({
                contentElement: '#myStaticDialog',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
}]);

require('./directives.js')(cacaoApp);
require('./factory.js')(cacaoApp);
require('./filter.js')(cacaoApp);
require('./service.js')(cacaoApp);
require('./const.js')(cacaoApp);
require('./ctrl/notification.js')(cacaoApp);
require('./ctrl/home.js')(cacaoApp);
require('./ctrl/team/list.js')(cacaoApp);
require('./ctrl/team/detail.js')(cacaoApp);
require('./ctrl/user/list.js')(cacaoApp);
require('./ctrl/user/detail.js')(cacaoApp);
require('./ctrl/nav.js')(cacaoApp);
require('./ctrl/login.js')(cacaoApp);
require('./ctrl/logout.js')(cacaoApp);
require('./ctrl/goid.js')(cacaoApp);
require('./ctrl/pmid.js')(cacaoApp);
require('./ctrl/review.js')(cacaoApp);
require('./ctrl/gaf/create.js')(cacaoApp);
require('./ctrl/gaf/list.js')(cacaoApp);
require('./ctrl/gaf/detail.js')(cacaoApp);
