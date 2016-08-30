export default function(cacaoApp) {
    cacaoApp.controller('SearchOrganismCtrl', ['$scope', 'CacaoBackend', '$location',
        function($scope, CacaoBackend, $location) {
            CacaoBackend.all('organisms').getList($scope.query).then(function(data) {
                $scope.organisms = data;
            });

            $scope.go_to_genes = function(organism) {
                $location.path('/search/gene/').search({orgID: organism.id});
            };
    }]);
}
