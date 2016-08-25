export default function(cacaoApp) {
    cacaoApp.controller('GAFCtrl', ['$scope', 'CacaoBackend', '$location', '$timeout', '$routeParams', 'ECO_CODES', 'QUALIFIERS', 'WITH_FROM_DB', '$mdDialog',
        function($scope, CacaoBackend, $location, $timeout, $routeParams, ECO_CODES, QUALIFIERS, WITH_FROM_DB, $mdDialog) {

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
                $scope.eco_codes = ECO_CODES;
                $scope.qualifiers = QUALIFIERS;
                $scope.with_from_db = WITH_FROM_DB;
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

            $scope.picture_popup = function(ev) {
                $mdDialog.show({
                    contentElement: '#go_term_pic',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
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
                    evidence_code: $scope.gafData.evidence_code,
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
}
