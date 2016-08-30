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
                if ($routeParams.gene_id) {
                    CacaoBackend.one('genes', $routeParams.gene_id).get().then(function(gene) {
                        $scope.gene = gene;
                        $scope.gafData.db_object_id = gene.db_object_id;
                        $scope.gaf_update(gene.db_object_id);
                        $location.search('gene_id', null);
                    });
                }
            }

            $scope.ordering = "go_id";

            $scope.query = {
                limit: 5,
                page: 1,
                ordering: $scope.ordering
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
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }
                $scope.query.ordering = $scope.ordering;
                $scope.promise = CacaoBackend.all('gafs').getList({db_object_id: $scope.prevAnnotData, page: $scope.query.page, ordering: $scope.query.ordering}).then(function(data) {
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
                $scope.query.ordering = $scope.ordering;

                if (g) {
                    $scope.promise = CacaoBackend.all('gafs').getList({db_object_id: g, ordering: $scope.query.ordering}).then(function(data) {
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
                    gene: $scope.gene,
                    review_state: 1,
                    qualifier: $scope.gafData.qualifier,
                    go_id: $scope.gafData.go_id,
                    db_reference: 'PMID:' + $scope.gafData.db_reference,
                    evidence_code: $scope.gafData.evidence_code,
                    with_or_from: with_or_from(),
                    aspect: $scope.gafData.aspect,
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
