var moment = require('moment');

export default function(cacaoApp) {
    cacaoApp.controller('ReviewCtrl', ['$scope', 'CacaoBackend', '$timeout', '$filter', '$q', '$mdDialog', 'DRF_URL',
        function($scope, CacaoBackend, $timeout, $filter, $q, $mdDialog, DRF_URL) {

            if ($scope.assessmentForm) {
                $scope.assessmentForm.$setUntouched();
            }

            $scope.gaf_set_list = [];
            $scope.gaf_current_index = 0;
            $scope.current_gaf = [];
            $scope.original_gaf = null;

            $scope.get_go_data = function(go_id) {
                var go_id_url = 'https://cpt.tamu.edu/onto_api/' + go_id + '.json'
                return CacaoBackend.oneUrl(' ', go_id_url).get().$object;
            };

            $scope.get_pmid_data = function(pmid) {
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
                var paper = CacaoBackend.one('papers', pmid).get().$object;
                if (paper.abstract) {
                    paper.short_abstract = trim_abstract(paper.abstract);
                }
                return paper;
            };

            $scope.showGOIDPopup = function(ev, go_id) {
                $scope.prevGOIDData = $scope.get_go_data(go_id);
                $mdDialog.show({
                    contentElement: '#goid',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
            };

            $scope.showPMIDPopup = function(ev, pmid) {
                $scope.prevPMIDData = $scope.get_pmid_data(pmid);
                $mdDialog.show({
                    contentElement: '#pmid',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
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

            CacaoBackend.all('gafs').getList({review_state: 1, page: 1, limit: 1}).then(function(outer_data) {
                var pageSize = 5;
                var requests = [];
                for(var currentPage = 0; currentPage < Math.ceil(outer_data.meta.count / pageSize); currentPage++) {
                    requests.push(
                        CacaoBackend.all('gafs').getList({review_state: 1, page: currentPage + 1, limit: pageSize}).then(function(data) {
                            data.map(function(gaf) {
                                gaf.assessment_notes= null;
                                gaf.flagged = {
                                    protein: null,
                                    qualifier: null,
                                    go_id: null,
                                    publication: null,
                                    evidence: null,
                                    notes: null,
                                }
                                gaf.show_db_reference = parseInt(gaf.db_reference.replace('PMID:', ''));
                                gaf.show_date = moment(gaf.date).fromNow();

                                var unique_gaf = true;
                                $scope.gaf_set_list.map(function(gaf_set) {
                                    if(gaf_set[0].challenge_gaf && gaf.challenge_gaf){
                                        if(gaf_set[0].challenge_gaf.original_gaf == gaf.challenge_gaf.original_gaf) {
                                            gaf_set.push(gaf);
                                            unique_gaf = false;
                                        }
                                    }
                                });
                                if (unique_gaf) {
                                    $scope.gaf_set_list.push([gaf]);
                                }
                                adjust_flags(gaf);
                            });
                        })
                    )
                }
                $q.all(requests).then(
                    function(data){
                        $scope.next();
                    });
            });

            var adjust_flags = function(gaf) {
                if (!gaf.challenge_gaf) {
                    return;
                }
                CacaoBackend.oneUrl('gafs', gaf.challenge_gaf.original_gaf).get().then(function(original) {
                    for (var field in gaf.plain()) {
                        if (original[field] != gaf[field]) {
                            var diff_field = $filter('field_to_flagged')(field);
                            if(diff_field) {
                                gaf.flagged[diff_field] = $filter('flags_to_text')(diff_field);
                            }
                        }
                    }
                });
            };

            $scope.submit_challenge_assessment = function() {
                $scope.isDisabled = true;
                var requests = [];
                for (var gaf in $scope.current_gaf) {
                    if ($filter('anyFlagged')($scope.current_gaf[gaf])) {
                        var x = $scope.submit_assessment($scope.current_gaf[gaf], 3, false);
                        requests.push(x);
                    } else {
                        $scope.original_gaf.review_state = 3;
                        $scope.original_gaf.superseded = DRF_URL + 'gafs/' + $scope.current_gaf[gaf].id + '/';
                        var x = $scope.original_gaf.put();
                        requests.push(x);
                        var y = $scope.submit_assessment($scope.current_gaf[gaf], 2, false);
                        requests.push(y);
                    }
                }

                $q.all(requests).then(function(data){
                    $scope.next();
                })
            };

            $scope.submit_assessment = function(gaf, state, auto_next) {
                $scope.isDisabled = true;
                gaf.review_state = state;
                return gaf.put().then(function() {
                    $scope.saveAssessment(gaf);
                    if(auto_next){
                        $scope.next();
                    }
                });
            };

            $scope.saveAssessment = function(gaf) {
                var notes = "Valid Annotation";
                var flagged = []

                // only change notes/flags if gaf was bad aka review_state 3
                if(gaf.review_state == 3) {
                    notes = gaf.assessment_notes;
                    for (var i in gaf.flagged) {
                        if (gaf.flagged[i] != null) {
                            flagged.push(gaf.flagged[i]);
                        }
                    }
                }

                CacaoBackend.all('assessments').post({
                    gaf: DRF_URL + 'gafs/' + gaf.id + '/',
                    notes: notes,
                    challenge: gaf.challenge_gaf ? DRF_URL + 'challenges/' + gaf.challenge_gaf.id + '/' : null,
                    flagged: flagged.join(),
                });
            };

            $scope.next = function() {
                if ($scope.gaf_current_index < $scope.gaf_set_list.length) {
                    $scope.remaining = true;
                    $scope.temp_gaf = $scope.gaf_set_list[$scope.gaf_current_index];

                    if ($scope.temp_gaf[0].challenge_gaf) {
                        CacaoBackend.oneUrl('gafs', $scope.temp_gaf[0].challenge_gaf.original_gaf).get().then(function(original) {
                            $scope.original_gaf = original;
                            $scope.original_gaf.show_db_reference = parseInt($scope.original_gaf.db_reference.replace('PMID:', ''));
                            $scope.original_gaf.show_date = moment(original.date).fromNow();
                            $scope.original_gaf_show = true;
                            $scope.current_gaf = $scope.temp_gaf;
                        });
                    } else {
                        $scope.original_gaf_show = false;
                        $scope.current_gaf = $scope.temp_gaf;
                    }

                    ++$scope.gaf_current_index;
                    $timeout(function () {
                        $scope.isDisabled = false;
                    }, 500);

                } else {
                    $scope.remaining = false;
                    if ($scope.original_gaf) {
                        $scope.original_gaf_show = false;
                    }
                }
            };

            $scope.plural = function() {
                if ($scope.current_gaf.length == 1) {
                    return '';
                } else {
                    return 's';
                }
            };
    }]);
}
