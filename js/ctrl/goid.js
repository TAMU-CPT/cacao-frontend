export default function(cacaoApp) {
    cacaoApp.controller('GOIDDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend', '$mdDialog',
        function($scope, $routeParams, CacaoBackend, $mdDialog) {
            var go_id_url = 'https://cpt.tamu.edu/onto_api/' + $routeParams.GOID + '.json'
            CacaoBackend.oneUrl(' ', go_id_url).get().then(
                function(success) {
                    $scope.goTermData = success;
                },
                function(fail) {
                    $scope.bad_go_id = $routeParams.GOID;
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
}
