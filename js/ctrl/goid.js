export default function(cacaoApp) {
    cacaoApp.controller('GOIDDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend', '$mdDialog', '$location',
        function($scope, $routeParams, CacaoBackend, $mdDialog, $location) {
            $scope.go_terms = require('json-loader!./gaf/phi.json');

            var go_id_url = 'https://cpt.tamu.edu/onto_api/' + $routeParams.GOID + '.json'
            CacaoBackend.oneUrl(' ', go_id_url).get().then(
                function(success) {
                    $scope.goTermData = success;
                },
                function(fail) {
                    if ($scope.go_terms[$routeParams.GOID] !== undefined){
                        $scope.goTermData = $scope.go_terms[$routeParams.GOID];
                    }
                    else {
                        $scope.bad_go_id = $routeParams.GOID;
                    }
                }
            );

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

            $scope.ordering = "db_reference";

            $scope.go = function(id) {
                $location.path('/gaf/' + id);;
            };

            $scope.updateData = function(page) {
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }
                $scope.query.ordering = $scope.ordering;

                $scope.promise = CacaoBackend.all('gafs').getList($scope.query).then(function(data) {
                    $scope.prev_annotations = data;
                });
            };

            $scope.options = {
                limitSelect: true,
                pageSelect: true
            };

            $scope.query = {
                go_id: $routeParams.GOID,
                limit: 5,
                page: 1,
                ordering: $scope.ordering,
            };

            $scope.updateData(1);
    }]);
}
