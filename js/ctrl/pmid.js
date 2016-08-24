export default function(cacaoApp) {
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
}
