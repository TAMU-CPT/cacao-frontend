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
require('lightbox2');
var jwt_decode = require('jwt-decode');
/* App Module */

const eco_codes = [
    'IDA: Inferred from Direct Assay',
    'IMP: Inferred from Mutant Phenotype',
    'IGI: Inferred from Genetic Interaction',
    'ISS: Inferred from Sequence Similarity',
    'ISO: Inferred from Sequence Orthology',
    'ISA: Inferred from Sequence Alignment',
    'ISM: Inferred from Sequence Model',
    'IGC: Inferred from Genomic Context',
];

const eco_code_defs = {
    'ND' : 'No Data',
    'IDA': 'Inferred from Direct Assay',
    'IMP': 'Inferred from Mutant Phenotype',
    'IGI': 'Inferred from Genetic Interaction',
    'IEA': 'Inferred from Electronic Assay',
    'ISS': 'Inferred from Sequence Similarity',
    'ISO': 'Inferred from Sequence Orthology',
    'ISA': 'Inferred from Sequence Alignment',
    'ISM': 'Inferred from Sequence Model',
    'IGC': 'Inferred from Genomic Context',
};

const qualifiers = [
    'NOT',
    'contributes_to',
    'colocalizes_with',
    //'Incorrect (CACAO)',
]

const with_from_db = [
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
            when('/gaf/create/:taxon?/:gene?', {
                templateUrl: 'partials/gaf.html',
                controller: 'GAFCtrl',
                reloadOnSearch: false
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
            when('/', {
                templateUrl: 'partials/home.html'
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
        var team_usernames = [];

        $scope.updateData = function(page) {
            $scope.query.page = page;
            CacaoBackend.all('gafs').getList($scope.query).then(function(data) {
                $scope.data = data;
            });
        };

        // previous annotations with same go id
        $scope.options = {
            limitSelect: true,
            pageSelect: true
        };


        CacaoBackend.one('groups', $routeParams.teamID).get().then(function(data) {
            $scope.team = data;

            $scope.query = {
                limit: 5,
                page: 1,
                team: data.id,
            };

            $scope.updateData(1);
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

        $scope.updateData = function(page) {
            $scope.query.page = page;
            CacaoBackend.all('gafs').getList($scope.query).then(function(data) {
                $scope.data = data;
            });
        };

        // previous annotations with same go id
        $scope.options = {
            limitSelect: true,
            pageSelect: true
        };


        CacaoBackend.one('users', $routeParams.userID).get().then(function(data) {
            $scope.user = data;

            $scope.query = {
                limit: 5,
                page: 1,
                owner: data.id,
            };

            $scope.updateData(1);
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

        $scope.query = {
            limit: 5,
            page: 1
        };

        $scope.updateData = function(page) {
            CacaoBackend.all('gafs').getList({db_reference : 'PMID:'+$routeParams.PMID, page: page}).then(function(data) {
                $scope.prev_annotations = data;
            });
        };

        // previous annotations with same pmid
        $scope.options = {
            limitSelect: true,
            pageSelect: true
        };

        $scope.query.page = 1;

        CacaoBackend.all('gafs').getList({db_reference: 'PMID:'+$routeParams.PMID}).then(function(data) {
            $scope.prev_annotations = data;
        });
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
cacaoApp.controller('GAFCtrl', ['$scope', 'CacaoBackend', '$location', '$timeout', '$routeParams',
    function($scope, CacaoBackend, $location, $timeout, $routeParams) {

        // collapses other cards if new gene id entered
        $scope.$watch('prevAnnotData', function(newValue, oldValue) {
            if (newValue != oldValue && !$scope.bad_db_object_id) {
                $scope.show_gafs = false;
                if ($scope.show_go != null) {
                    $scope.show_go = true;
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
            $scope.eco_codes = eco_codes;
            $scope.qualifiers = qualifiers;
            $scope.with_from_db = with_from_db;
            $scope.gafData.go_id = "GO:";
            if ($routeParams.taxon) {
                $scope.gafData.taxon = $routeParams.taxon;
                $location.search('taxon', null);
            }
            else {
                $scope.gafData.taxon = '';
            }
            if ($routeParams.gene) {
                $scope.gaf_update($routeParams.gene);
                $scope.gafData.db_object_id = "" + $routeParams.gene;
                $scope.gafData.db_object_symbol = $routeParams.gene;
                $scope.disable_field = true;
                $location.search('gene', null);
            }
            else {
                 $scope.gafData.db_object_id = '';
                 $scope.gafData.db_object_symbol = '';
                 $scope.disable_field = false;
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


        $scope.gafData = {
            db: 'UniProtKB',
            db_object_type: 'protein',
            assigned_by: 'CPT',
        };
        init();

        $scope.saveData = function() {
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
                qualifier: $scope.gafData.qualifier,
                go_id: $scope.gafData.go_id,
                db_reference: 'PMID:' + $scope.gafData.db_reference,
                evidence_code: $scope.gafData.evidence_code.slice(0,3),
                with_or_from: with_or_from(),
                aspect: $scope.gafData.aspect,
                db_object_type: $scope.gafData.db_object_type,
                taxon: $scope.gafData.taxon,
                assigned_by: $scope.gafData.assigned_by,
                notes: $scope.gafData.notes,
            })
            .then(function(gaf) {
                $location.path('/gaf/' + gaf.id);
            }, function() {
                console.log("there was an error");
            });
        };
}]);

cacaoApp.filter('review_state_to_english', function() {
    return function(input) {
        switch(input){
            case 0:
                return "External";
            case 1:
                return "Unreviewed";
            case 2:
                return "Accepted";
            case 3:
                return "Rejected";
        }
    };
});

cacaoApp.filter('eco_to_text', function() {
    return function(input, full) {
        if(full){
            return input + ': ' + eco_code_defs[input];
        } else {
            return eco_code_defs[input];
        }
    };
});

cacaoApp.filter('text_to_eco', function() {
    return function(input) {
        return input.replace(/:.*/g, '');
    };
});

cacaoApp.filter('text_to_qualifier', function() {
    return function(input) {
        switch(input){
            case 'NOT': return 'NOT';
            case 'Contributes to': return 'contributes_to';
            case 'Colocalizes with': return 'colocalizes_with';
        }
    };
})

cacaoApp.filter('qualifier_to_text', function() {
    return function(input) {
        switch(input){
            case 'NOT': return 'NOT';
            case 'contributes_to': return 'Contributes to';
            case 'colocalizes_with': return 'Colocalizes with';
            default: return 'None';
        }
    };
})

cacaoApp.filter('header_color', function() {
    return function(input) {
        switch(input){
            case 0:
                return 'rgba(226, 226, 226, 1)';
            case 1:
                return 'rgba(249, 243, 65, .32)';
            case 2:
                return 'rgba(105, 197, 82, 0.18)';
            case 3:
                return 'rgba(244, 67, 54, 0.38)';
        }
    }
})

cacaoApp.filter('header_icon', function() {
    return function(input) {
        switch(input){
            case 1:
                return "hourglass_full";
            case 2:
                return "done";
            case 3:
                return "close";
        }
    };
});

cacaoApp.filter('goChartUrl', function() {
    return function(input) {
        return 'http://www.ebi.ac.uk/QuickGO-Beta/services/chart?ids=' + input;
    };
});

cacaoApp.controller('ReviewCtrl', ['$scope', 'CacaoBackend', '$timeout', '$filter',
    function($scope, CacaoBackend, $timeout, $filter) {
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
        };

        var next_gaf = function() {
            CacaoBackend.all('gafs').getList({review_state: 1,}).then(function(data) {
                $scope.num_left = data.meta.count;
                if ($scope.num_left > 0) {
                    $scope.current_gaf = data[0];
                    $scope.current_gaf.show_db_reference = parseInt($scope.current_gaf.db_reference.replace('PMID:', ''));
                    if (!$scope.current_gaf.qualifier) {
                        $scope.current_gaf.show_qualifier = "None";
                    } else {
                        $scope.current_gaf.show_qualifier = $filter('qualifier_to_text')($scope.current_gaf.qualifier);
                    }
                }
            });
        };

        $scope.put_gaf= function(state) {
            $scope.current_gaf.review_state=state;
            $scope.current_gaf.put();
            $scope.saveAssessment();
            $timeout(next_gaf, 100);
            init();
        };

        $scope.anyFlagged = function() {
            // Check if any of them are non-null
            return Object.keys($scope.flagged).map(function (key) {
                return $scope.flagged[key] !== null;
            }).some(function(val){
                return val;
            });
        }

        // get initial object on page load
        CacaoBackend.all('gafs').getList({review_state: 1,}).then(function(data) {
            $scope.num_left = data.meta.count;
            if ($scope.num_left > 0) {
                $scope.current_gaf = data[0];
                $scope.current_gaf.show_db_reference = parseInt($scope.current_gaf.db_reference.replace('PMID:', ''));
                if (!$scope.current_gaf.qualifier) {
                     $scope.current_gaf.show_qualifier = "None";
                } else {
                    $scope.current_gaf.show_qualifier = $filter('qualifier_to_text')($scope.current_gaf.qualifier);
                }
            }
        });

        init();

        $scope.saveAssessment = function() {
            var notes = "Valid Annotation";
            var flagged = []

            // only change notes/flags if gaf was bad aka review_state 3
            if($scope.current_gaf.review_state == 3) {
                notes = $scope.assessment.notes;
                for (var i in $scope.flagged) {
                    if ($scope.flagged[i] != null) {
                        flagged.push($scope.flagged[i]);
                    }
                }
            }

            CacaoBackend.all('assessments').post({
                gaf: 'http://localhost:8000/gafs/' + $scope.current_gaf.id + '/',
                notes: notes,
                flagged: flagged.join(),
            });
        };
}]);

cacaoApp.controller('GAFDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend', '$location', '$localStorage', '$filter',
    function($scope, $routeParams, CacaoBackend, $location, $localStorage, $filter) {
        $scope.current_user = $localStorage.jwtData.username;
        $scope.challenge = false;

        $scope.reveal_gaf_form = function() {
            $scope.eco_codes = eco_codes;
            $scope.qualifiers = qualifiers;
            $scope.with_from_db = with_from_db;

            $scope.gafData = angular.copy($scope.gaf);
            $scope.gafData.evidence_code = $filter('eco_to_text_full')($scope.gafData.evidence_code);
            $scope.gafData.with_from_db = $scope.gaf.with_or_from.split(':')[0];
            $scope.gafData.with_from_id = $scope.gaf.with_or_from.split(':')[1];
        }

        CacaoBackend.one('gafs', $routeParams.gafID).get().then(function(data) {
            $scope.gaf = data;

            $scope.gaf.db_reference = parseInt($scope.gaf.db_reference.replace('PMID:', ''));
            console.log($scope.gaf.qualifier);
        });

        $scope.saveData = function() {
            console.log($scope.gafData);
            //console.log($scope.gafData.show_qualifier);
            //console.log($scope.gafData.qualifier);
            //console.log($scope.gaf.show_qualifier);
            //console.log($scope.gaf.qualifier);
            //function with_or_from() {
                //if ($scope.gafData.evidence_code.slice(0,3) != 'IDA' && $scope.gafData.evidence_code.slice(0,3) != 'IMP') {
                    //return $scope.gafData.with_from_db + ':' +  $scope.gafData.with_from_id;
                //} else {
                    //return '';
                //}
            //};

            //CacaoBackend.all('gafs').post({
                //db: $scope.gafData.db,
                //review_state: 1,
                //db_object_id: $scope.gafData.db_object_id,
                //db_object_symbol: $scope.gafData.db_object_symbol,
                //qualifier: $scope.gafData.qualifier,
                //go_id: $scope.gafData.go_id,
                //db_reference: 'PMID:' + $scope.gafData.db_reference,
                //evidence_code: $scope.gafData.evidence_code.slice(0,3),
                //with_or_from: with_or_from(),
                //aspect: $scope.gafData.aspect,
                //db_object_type: $scope.gafData.db_object_type,
                //taxon: $scope.gafData.taxon,
                //assigned_by: $scope.gafData.assigned_by,
                //notes: $scope.gafData.notes,
            //})
            //.then(function(gaf) {
                //$location.path('/gaf/' + gaf.id);
            //}, function() {
                //console.log("there was an error");
            //});
        };
}]);

cacaoApp.controller('TestCtrl', ['$scope', 'CacaoBackend',
    function($scope, CacaoBackend) {
        $scope.onOff = false;
}]);
