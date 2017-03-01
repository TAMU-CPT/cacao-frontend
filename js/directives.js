export default function(cacaoApp) {
    cacaoApp.directive('textarea', ['$timeout', function($timeout){
     return {
       restrict: 'E',
       link: function(scope, element){
         $timeout(function(){
            element.off('scroll');
         }, 0, false);
       }
     }
    }]);

    cacaoApp.directive('goidCustomdir', ['CacaoBackend', function(CacaoBackend) {
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
    }]);

    cacaoApp.directive('pmidCustomdir', ['CacaoBackend', function(CacaoBackend) {
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
    }]);

    cacaoApp.directive("userIcon", function() {
        return {
            scope: {},
            templateUrl: 'partials/user/icon.html',
            link: function(scope, element, attrs) {
                scope.user = JSON.parse(attrs.user);
            }
        };
    });
}
