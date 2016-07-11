'use strict';

/* App Module */

var cacaoApp = angular.module('cacaoApp', [
    'ngRoute',
    'restangular',
    'ngMdIcons',
    'ngMaterial',
    'ui.gravatar',
    'ngMessages',
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
            when('/gaf', {
                templateUrl: 'partials/gaf.html',
                controller: 'GAFCtrl'
            }).
            when('/logout', {
                templateUrl: 'partials/login.html',
                controller: 'LogOutCtrl'
            }).
            when('/', {
                templateUrl: 'partials/home.html'
            }).
            otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
            return {
               'request': function (config) {
                   // ignore if request is to GO backend
                   if (config.url.startsWith('http://localhost:9000')) {
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
                       $location.path('/login');
                   }
                   return $q.reject(response);
               }
           };
        }]);
}]);

cacaoApp.factory('CacaoBackend', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('http://localhost:8000/');
        RestangularConfigurer.setRequestSuffix('/');
        RestangularConfigurer.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
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
    });
});

cacaoApp.controller('TeamListCtrl', ['$scope', 'CacaoBackend',
    function($scope, CacaoBackend) {
        CacaoBackend.all('groups').getList().then(function(data) {
            $scope.teams = data;
        });
}]);

cacaoApp.controller('TeamDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
    function($scope, $routeParams, CacaoBackend) {
        CacaoBackend.one('groups', $routeParams.teamID).get().then(function(data) {
            $scope.team = data;
        });
}]);

cacaoApp.controller('UserListCtrl', ['$scope', 'CacaoBackend',
    function($scope, CacaoBackend) {
        CacaoBackend.all('users').getList().then(function(data) {
            $scope.users = data;
        });

}]);

cacaoApp.controller('UserDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
    function($scope, $routeParams, CacaoBackend) {
        CacaoBackend.one('users', $routeParams.userID).get().then(function(data) {
            $scope.user = data;
        });
}]);

// nav
cacaoApp.controller('NavCtrl', ['$scope', '$mdSidenav', '$localStorage', '$location', 'CacaoBackend',
    function ($scope, $mdSidenav, $localStorage, $location, CacaoBackend) {
        $scope.userData = {};
        $scope.toggleRight = buildToggler('right');

        $scope.go = function(route){
            if (route == '/teams/') {
                CacaoBackend.one('users', $scope.userData.user_id).get().then(function(data) {
                    $location.path(route + data.group[0].id);
                });
            }
            else { $location.path(route); }
            $mdSidenav('right').toggle();
        }

        function buildToggler(navID) {
            return function() {
                $scope.userData = $localStorage.jwtData;
                $mdSidenav(navID).toggle();
            }
        }
}]);

cacaoApp.controller('LogOutCtrl', ['$scope', '$http', '$localStorage', '$location',
    function($scope, $http, $localStorage, $location) {
        console.log("Logging Out");
        $localStorage.jwtToken = null;
        $localStorage.jwtData = {};
        console.log($localStorage.jwtData);
        $location.path('/');
    }
]);

// log in
cacaoApp.controller('LoginCtrl', ['$scope', '$http', '$localStorage', '$location',
    function($scope, $http, $localStorage, $location) {
        $scope.userData = {};
        $scope.saveData = function() {
            if ($scope.loginForm.$valid) {
                $http.post('http://localhost:8000/api-token-auth/', $scope.userData)
                    .success(function(data) {
                        $localStorage.jwtToken = data.token;
                        $localStorage.jwtData = jwt_decode(data.token);
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

// GAF
cacaoApp.controller('GAFCtrl', ['$scope', 'CacaoBackend', '$localStorage',
    function($scope, CacaoBackend, $localStorage) {
        function init() {
            $scope.gafData.go_id = "GO:";
        }
        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        $scope.eco_codes = [
            'IDA: Inferred from Direct Assay',
            'IMP: Inferred from Mutant Phenotype',
            'IGI: Inferred from Genetic Interaction',
            'ISS: Inferred from Sequence Similarity',
            'ISO: Inferred from Sequence Orthology',
            'ISA: Inferred from Sequence Alignment',
            'ISM: Inferred from Sequence Model',
            'IGC: Inferred from Genomic Context',
        ];

        // gets go_id on blur and updates goTermData
        $scope.try_go_id = function() {
            var go_id = $scope.gafData.go_id;
            if (go_id) {
                var go_id_url = 'http://localhost:9000/' + go_id + '.json'
                CacaoBackend.oneUrl(' ', go_id_url).get().then(
                    function(success) {
                        $scope.bad_go_id = null;
                        $scope.goTermData = success;
                    },
                    function(fail) {
                        $scope.bad_go_id = go_id;
                        $scope.goTermData = null;
                    }
                );
            }
            else {
                $scope.bad_go_id = null;
            }
        };

        // gets pmid on blur and updates pubmedData
        $scope.try_db_ref= function() {
            var pmid = $scope.gafData.db_reference;
            if (pmid) {
                CacaoBackend.one('papers', pmid).get().then(
                    function(success) {
                        $scope.bad_pmid = null;
                        $scope.pubmedData = success;
                    },
                    function(fail) {
                        $scope.bad_pmid = pmid;
                        $scope.pubmedData = null;
                    }
                );
            }
            else {
                $scope.bad_pmid= null;
            }
        };

        $scope.gafData = { db: 'UniProtKB', };
        init();

        $scope.user = {};
        if ($scope.jwtData) {
            $scope.user = $localStorage.jwtData.username;
        }
        $scope.saveData = function() {
            $scope.gafData["owner"] = $scope.user;
            //Restangular.all('gafs').post($scope.gafData);
        };
}]);
