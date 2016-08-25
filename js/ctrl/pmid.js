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

            $scope.ordering = "go_id";

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
                db_reference: 'PMID:'+$routeParams.PMID,
                limit: 5,
                page: 1,
                ordering: $scope.ordering,
            };

            $scope.updateData(1);
    }]);
}
