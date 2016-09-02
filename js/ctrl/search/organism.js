export default function(cacaoApp) {
    cacaoApp.controller('SearchOrganismCtrl', ['$scope', 'CacaoBackend', '$location',
        function($scope, CacaoBackend, $location) {

            $scope.go_to_genes = function(organism) {
                $location.path('/search/gene/').search({orgID: organism.id});
            };

            $scope.ordering = "common_name";

            $scope.updateData = function(page) {
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }

                $scope.query.ordering = $scope.ordering;
                $scope.query.common_name = $scope.search_input;

                $scope.promise = CacaoBackend.all('organisms').getList($scope.query).then(function(data) {
                    $scope.organisms = data;
                });
            };

            $scope.options = {
                limitSelect: true,
                pageSelect: true
            };

            $scope.query = {
                common_name: $scope.search_input,
                limit: 5,
                page: 1,
                ordering: $scope.ordering,
            };

            $scope.updateData(1);
    }]);
}
