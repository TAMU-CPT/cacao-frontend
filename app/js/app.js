'use strict';

/* App Module */

var cacaoApp = angular.module('cacaoApp', [
    'ngRoute',
    'restangular'
]);

cacaoApp.config(['$routeProvider', 'RestangularProvider',
    function($routeProvider, RestangularProvider) {
        $routeProvider.
            when('/teams', {
                templateUrl: 'partials/team-list.html',
                controller: 'TeamListCtrl'
            }).
            when('/teams/:teamID', {
                templateUrl: 'partials/team-detail.html',
                controller: 'TeamDetailCtrl'
            }).
            otherwise({
                redirectTo: '/teams'
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
}]);

cacaoApp.controller('TeamListCtrl', ['$scope', 'Restangular',
    function($scope, Restangular) {
        var promise = Restangular.all('groups').getList();
        var resolveGroup = function(data) {
            $scope.teams = data;
        }
        promise.then(resolveGroup);
}]);

cacaoApp.controller('TeamDetailCtrl', ['$scope', '$routeParams', 'Restangular',
    function($scope, $routeParams, Restangular) {
        var promise = Restangular.one('groups', $routeParams.teamID).get();

        var resolveGroup = function(data) {
            $scope.team = data;
        }

        promise.then(resolveGroup);
}]);
