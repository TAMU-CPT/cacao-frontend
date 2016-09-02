export default function(cacaoApp) {
    cacaoApp.controller('SearchGeneCtrl', ['$scope', 'CacaoBackend', '$location', '$routeParams',
        function($scope, CacaoBackend, $location, $routeParams) {

            $scope.create_gaf = function(gene) {
                $location.path('/gaf/create/').search({gene_id: gene.id});
            };

            $scope.ordering = "start";

            $scope.updateData = function(page) {
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }

                $scope.query.ordering = $scope.ordering;
                $scope.query.db_object_id = $scope.search_input;

                $scope.promise = CacaoBackend.all('genes').getList($scope.query).then(function(data) {
                    $scope.genes = data;
                });
            };
            $scope.options = {
                limitSelect: true,
                pageSelect: true
            };

            $scope.query = {
                db_object_id: $scope.search_input,
                org_id: $routeParams.orgID,
                limit: 5,
                page: 1,
                ordering: $scope.ordering,
            };

            $scope.updateData(1);
    }]);
}
