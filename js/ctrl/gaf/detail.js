var moment = require('moment');
export default function(cacaoApp) {
    cacaoApp.controller('GAFDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend', '$location', '$localStorage', '$filter', '$mdDialog', 'ECO_CODES', 'QUALIFIERS', 'WITH_FROM_DB', '$timeout', 'DRF_URL',
        function($scope, $routeParams, CacaoBackend, $location, $localStorage, $filter, $mdDialog, ECO_CODES, QUALIFIERS, WITH_FROM_DB, $timeout, DRF_URL) {
            $scope.current_user = $localStorage.jwtData;
            $scope.challenge = false;

            $scope.reveal_gaf_form = function() {
                $scope.challenge = true;
                $scope.eco_codes = ECO_CODES;
                $scope.qualifiers = QUALIFIERS;
                $scope.with_from_db = WITH_FROM_DB;

                $scope.gafData = angular.copy($scope.gaf);
                $scope.gafData.notes = null;
                $scope.gafData.with_from_db = $scope.gaf.with_or_from.split(':')[0];
                $scope.gafData.with_from_id = $scope.gaf.with_or_from.split(':')[1];
            };

            $scope.options = {
                limitSelect: true,
            };

            $scope.query = {
                limit: 5,
            };

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

            $scope.picture_popup = function(ev) {
                $mdDialog.show({
                    contentElement: '#go_term_pic',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
            };

            $scope.showGOIDPopup = function(ev, go_id) {
                // use to test spinner
                //$timeout(function() {
                    //$scope.prevGOIDData = $scope.get_go_data(go_id);
                //}, 3000);
                $scope.prevGOIDData = $scope.get_go_data(go_id);
                $mdDialog.show({
                    contentElement: '#goid',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
            };

            $scope.showPMIDPopup = function(ev, pmid) {
                // use to test spinner
                //$timeout(function() {
                    //$scope.prevPMIDData = $scope.get_pmid_data(pmid);
                //}, 3000);
                $scope.prevPMIDData = $scope.get_pmid_data(pmid);
                $mdDialog.show({
                    contentElement: '#pmid',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.get_superseded = function() {
                // don't know if url will always have trailing slash
                var u = $scope.gaf.superseded.split('/');
                if (u.pop()) {
                    var id = u.pop();
                } else { id = u.pop(); }
                $location.path('/gaf/' + id);
            };

            $scope.saveData = function() {
                function with_or_from() {
                    if ($scope.gafData.evidence_code != 'IDA' && $scope.gafData.evidence_code != 'IMP') {
                        return $scope.gafData.with_from_db + ':' +  $scope.gafData.with_from_id;
                    } else {
                        return '';
                    }
                };

                CacaoBackend.all('gafs').post({
                    db: $scope.gafData.db,
                    review_state: 1,
                    qualifier: $scope.gafData.qualifier,
                    gene: $scope.gafData.gene,
                    go_id: $scope.gafData.go_id,
                    db_reference: 'PMID:' + $scope.gafData.db_reference,
                    evidence_code: $scope.gafData.evidence_code,
                    with_or_from: with_or_from(),
                    aspect: $scope.gafData.aspect,
                    db_object_type: $scope.gafData.db_object_type,
                    assigned_by: $scope.gafData.assigned_by,
                    notes: $scope.gafData.notes,
                })
                .then(function(gaf) {
                    CacaoBackend.all('challenges').post({
                        challenge_gaf: DRF_URL + 'gafs/' + gaf.id + '/',
                        original_gaf: DRF_URL + 'gafs/' + $scope.gaf.id + '/',
                        reason: $scope.challenge_data.notes,
                    })
                    .then(function() {
                        $location.path('/review');
                    });
                }, function() {
                    console.log("there was an error");
                });
            };

            $scope.promise = CacaoBackend.one('gafs', $routeParams.gafID).get().then(function(gaf) {
                $scope.gaf = gaf;

                if ($scope.gaf.challenge_gaf && $scope.gaf.review_state != 2) {
                    var u = $scope.gaf.challenge_gaf.original_gaf.split('/');
                    if (u.pop()) {
                        var id = u.pop();
                    } else { id = u.pop(); }
                    $location.path('/gaf/' + id);
                }

                $scope.gaf.show_qualifier = $filter('qualifier_to_text')($scope.gaf.qualifier);
                $scope.gaf.db_reference = parseInt($scope.gaf.db_reference.replace('PMID:', ''));

                function formatEntry(obj){
                    return {
                        star: obj.star,
                        event_name: obj.event_name,
                        event_type: obj.event_type,
                        user: obj.user,
                        notes: obj.notes,
                        date: moment(obj.date).fromNow(),
                        date_real: moment(obj.date).format('MMMM Do YYYY, h:mm:ss a')
                    };
                };

                $scope.event_info = []
                var null_event = {
                    star: true,
                    event_name: null,
                    event_type: null,
                    user: null,
                    notes: null,
                    date: null,
                }
                if (gaf.assessment) {
                    $scope.event_info.push(formatEntry({
                        event_name: 'Initial Review',
                        event_type: 'Assessment',
                        user: gaf.assessment.owner,
                        notes: gaf.assessment.notes,
                        date: gaf.assessment.date,
                    }));
                    $scope.event_info.push(_.clone(null_event));
                }
                for (var chal in gaf.original_gaf) {
                    $scope.event_info.push(formatEntry({
                        event_name: 'Challenge',
                        event_type: 'Proposed Annotation',
                        user: gaf.original_gaf[chal].owner,
                        notes: gaf.original_gaf[chal].reason,
                        date: gaf.original_gaf[chal].date,
                    }));
                    if (gaf.original_gaf[chal].assessment) {
                        $scope.event_info.push(formatEntry({
                             event_name: '',
                             event_type: 'Assessment',
                             user: gaf.original_gaf[chal].assessment.owner,
                             notes: gaf.original_gaf[chal].assessment.notes,
                             date: gaf.original_gaf[chal].assessment.date,
                        }));
                    }
                    $scope.event_info.push(_.clone(null_event));
                }

                if ($scope.event_info.length > 1) {
                    var event_info_copy = _.clone($scope.event_info);
                    event_info_copy.pop();
                    $scope.last_date = event_info_copy.pop().date;
                }
            }, function() {
                    $scope.no_gaf = true;
            });
    }]);
}
