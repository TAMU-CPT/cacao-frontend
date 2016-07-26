'use strict';

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
                controller: 'ReviewCtrl'
            }).
            when('/test', {
                templateUrl: 'partials/test.html',
                controller: 'TestCtrl'
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
                       $location.path('/login');
                   }
                   return $q.reject(response);
               }
           };
        }]);
}]);

cacaoApp.directive('goidCustomdir', function(CacaoBackend) {
    return {
        require: 'ngModel',
        link: function($scope, element, attribute, ctrl) {
            function customValidator(ngModelValue) {
                var go_id = ngModelValue;
                if (go_id.startsWith('GO:')) {
                    ctrl.$setValidity('startwithGo', true);
                    if (go_id.length == 3) {
                        $scope.bad_go_id = null;
                        $scope.goTermData = null;
                    }
                    else {
                        var go_id_url = 'https://cpt.tamu.edu/onto_api/' + go_id + '.json'
                        CacaoBackend.oneUrl(' ', go_id_url).get().then(
                            function(success) {
                                $scope.bad_go_id = null;
                                $scope.goTermData = success;
                                ctrl.$setValidity('customRequired', true);
                                var aspect = {
                                    'biological_process': 'P',
                                    'molecular_function': 'F',
                                    'cellular_component': 'C',
                                }
                                $scope.gafData.aspect = aspect[$scope.goTermData.namespace];
                            },

                            function(fail) {
                                $scope.bad_go_id = go_id;
                                $scope.goTermData = null;
                                ctrl.$setValidity('customRequired', false);
                            }
                        );
                    }
                }
                else if (go_id){
                    $scope.bad_go_id = null;
                    $scope.goTermData = null;
                    ctrl.$setValidity('startwithGo', false);
                }
                else {
                    $scope.bad_go_id = null;
                    $scope.goTermData = null;
                    ctrl.$setValidity('customRequired', false);
                }

                return ngModelValue;
            }
            ctrl.$parsers.push(customValidator);
        }
    };
});

cacaoApp.directive('pmidCustomdir', function(CacaoBackend) {
    return {
        require: 'ngModel',
        link: function($scope, element, attribute, ctrl) {
            function customValidator(ngModelValue) {
                var pmid = ngModelValue;
                if (pmid && pmid > -1) {
                    CacaoBackend.one('papers', pmid).get().then(
                        function(success) {
                            $scope.bad_pmid = null;
                            $scope.pubmedData = success;

                            // shortens abstract
                            function trim_abstract(a) {
                                a = a.replace(/^(.{250}[^\s]*).*/, "$1");
                                if (a.endsWith('.')) {
                                    a = a.concat('..');
                                }
                                else {
                                    a = a.concat('...');
                                }
                                return a
                            };

                            ctrl.$setValidity('pmidValid', true);
                            if ($scope.pubmedData.abstract) {
                                $scope.pubmedData.short_abstract = trim_abstract($scope.pubmedData.abstract);
                            }
                        },
                        function(fail) {
                            $scope.bad_pmid = 'PMID:' + String(pmid);
                            $scope.pubmedData = null;
                            ctrl.$setValidity('pmidValid', false);
                        }
                    );
                }
                else {
                    $scope.bad_pmid= null;
                    ctrl.$setValidity('pmidValid', false);
                    $scope.pubmedData = null;
                }

                return ngModelValue;
            }
            ctrl.$parsers.push(customValidator);
        }
    };
});

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

cacaoApp.controller('PMIDDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
    function($scope, $routeParams, CacaoBackend) {
        CacaoBackend.one('papers').one($routeParams.PMID).get().then(
            function(success) {
                $scope.pubmedData = success;
            },
            function(fail) {
                $scope.bad_pmid = $routeParams.PMID;
            }
        );
}]);

cacaoApp.controller('GOIDDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
    function($scope, $routeParams, CacaoBackend) {
        var go_id_url = 'https://cpt.tamu.edu/onto_api/' + $routeParams.GOID + '.json'
        CacaoBackend.oneUrl(' ', go_id_url).get().then(
            function(success) {
                $scope.goTermData = success;
            },
            function(fail) {
                $scope.bad_go_id = $routeParams.GOID;
            }
        );

        $scope.query = {
            limit: 5,
            page: 1
        };

        $scope.updateData = function(page) {
            CacaoBackend.all('gafs').getList({go_id: $routeParams.GOID, page: page}).then(function(data) {
                $scope.prev_annotations = data;
            });
        };

        // previous annotations with same go id
        $scope.options = {
            limitSelect: true,
            pageSelect: true
        };

        $scope.query.page = 1;

        CacaoBackend.all('gafs').getList({go_id: $routeParams.GOID}).then(function(data) {
            $scope.prev_annotations = data;
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
        $localStorage.jwtToken = null;
        $localStorage.jwtData = {};
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
cacaoApp.controller('GAFCtrl', ['$scope', 'CacaoBackend', '$localStorage', '$location', '$filter', 'Restangular', '$timeout',
    function($scope, CacaoBackend, $localStorage, $location, $filter, Restangular, $timeout) {

        // collapses other cards if new gene id entered
        $scope.$watch('prevAnnotData', function(newValue, oldValue) {
            if (newValue != oldValue && !$scope.bad_db_object_id) {
                $scope.show_gafs = false;
                if ($scope.show_go != null) {
                    $scope.show_go =true;
                }
                if ($scope.show_paper != null) {
                    $scope.show_paper = true;
                }
            }
        });

        // collapses other cards if new go term entered
        $scope.$watch('goTermData', function(newValue, oldValue) {
            if (newValue != oldValue && !$scope.bad_go_id) {
                $scope.show_go = false;
                if ($scope.show_gafs != null) {
                    $scope.show_gafs = true;
                }
                if ($scope.show_paper != null) {
                    $scope.show_paper = true;
                }
            }
        });

        // collapses other cards if new paper entered
        $scope.$watch('pubmedData', function(newValue, oldValue) {
            if (newValue != oldValue && !$scope.bad_pmid) {
                $scope.show_paper = false;
                if ($scope.show_gafs != null) {
                    $scope.show_gafs = true;
                }
                if ($scope.show_go != null) {
                    $scope.show_go = true;
                }
            }
        });

        function init() {
            $scope.gafData.go_id = "GO:";
            $scope.urlParams = $location.search();
            if ($scope.urlParams.taxon) {
                $scope.gafData.taxon = $scope.urlParams.taxon;
            }
            else {
                $scope.gafData.taxon = '';
            }
            if ($scope.urlParams.gene) {
                $scope.gaf_update($scope.urlParams.gene);
                $scope.gafData.db_object_id = $scope.urlParams.gene;
                $scope.gafData.db_object_symbol = $scope.urlParams.gene;
            }
            else {
                 $scope.gafData.db_object_id = '';
                 $scope.gafData.db_object_symbol = '';
            }
        }

        $scope.query = {
            limit: 5,
            page: 1
        };

        $scope.updateData = function(page) {
            CacaoBackend.all('gafs').getList({db_object_id: $scope.prevAnnotData, page: page}).then(function(data) {
                $scope.prev_annotations = data;
            });
        };

        // previous annotations with same gene id
        $scope.gaf_update = function(g) {
            $scope.options = {
                limitSelect: true,
                pageSelect: true
            };

            $scope.query.page = 1;

            if (g) {
                CacaoBackend.all('gafs').getList({db_object_id: g}).then(function(data) {
                    $scope.prev_annotations = data;
                    $scope.prevAnnotData = g;
                    $scope.bad_db_object_id = null;
                    if ($scope.prev_annotations.length < 1){
                        $scope.prevAnnotData = null;
                        $scope.bad_db_object_id = g;
                    }
                });
            }
            else {
                 $scope.prevAnnotData = null;
                 $scope.bad_db_object_id = null;
            }
        };

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

        $scope.qualifiers = [
            'NOT',
            'Contributes to',
            'Colocalizes with',
            //'Incorrect (CACAO)',
        ]

        $scope.with_from_db = [
             'UniProtKB',
             'PMID',
             'InterPro',
             'EcoCyc',
             'DictyBase',
             'FB',
             'MGI',
             'SGD',
             'TAIR',
             'WB',
             'Zfin',
        ]

        $scope.gafData = {
            db: 'UniProtKB',
            db_object_type: 'protein',
            assigned_by: 'CPT',
        };
        init();

        $scope.saveData = function() {
            // qualifier
            var quals = {
                'NOT': 'NOT',
                'Contributes to': 'contributes_to',
                'Colocalizes with': 'colocalizes_with',
            };

            function with_or_from() {
                if ($scope.gafData.with_from_db && $scope.gafData.with_from_id) {
                    return $scope.gafData.with_from_db + ':' +  $scope.gafData.with_from_id;
                }
                else {
                    return '';
                }
            };

            CacaoBackend.all('gafs').post({
                db: $scope.gafData.db,
                review_state: 1,
                db_object_id: $scope.gafData.db_object_id,
                db_object_symbol: $scope.gafData.db_object_symbol,
                qualifier: quals[$scope.gafData.qualifier],
                go_id: $scope.gafData.go_id,
                db_reference: 'PMID:' + $scope.gafData.db_reference,
                evidence_code: $scope.gafData.evidence_code.slice(0,3),
                with_or_from: with_or_from(),
                aspect: $scope.gafData.aspect,
                db_object_type: $scope.gafData.db_object_type,
                taxon: $scope.gafData.taxon,
                assigned_by: $scope.gafData.assigned_by,
                notes: $scope.gafData.notes,
            });
        };
}]);

cacaoApp.controller('ReviewCtrl', ['$scope', 'CacaoBackend', '$timeout',
    function($scope, CacaoBackend, $timeout) {
        function init() {
            if ($scope.assessmentForm) {
                $scope.assessmentForm.$setUntouched();
                $scope.assessment = {};
            }
            $scope.flagged = {
                protein: null,
                qualifier: null,
                go_id: null,
                publication: null,
                evidence: null,
            }
            console.log($scope.flagged);
        };

        var next_gaf = function() {
            CacaoBackend.all('gafs').getList({review_state: 1,}).then(function(data) {
                $scope.current_gaf = data[0];
                $scope.num_left = data.meta.count;
            });
        };

        $scope.put_gaf= function(state) {
            $scope.current_gaf.review_state=state;
            $scope.current_gaf.put();
            $timeout(next_gaf, 100);
            init();
        };

        var check = function() {
            console.log($scope.flagged);
            console.log("checked");
        };

        $scope.anyFlagged = function() {
            // Check if any of them are non-null
            return Object.keys($scope.flagged).map(function (key) {
                return $scope.flagged[key] !== null;
            }).some(function(val){
                return val;
            });
        }

        $scope.checked = function() {
            $timeout(check, 100);
        };

        // get initial object on page load
        CacaoBackend.all('gafs').getList({review_state: 1,}).then(function(data) {
            $scope.current_gaf = data[0];
            $scope.num_left = data.meta.count;
        });

        init();
}]);
