export default function(cacaoApp) {
    cacaoApp.controller('SearchGeneCtrl', ['$scope', 'CacaoBackend', '$location', '$routeParams',
        function($scope, CacaoBackend, $location, $routeParams) {
            CacaoBackend.all('genes').getList({org_id: $routeParams.orgID}).then(function(data) {
                $scope.genes = data;
            });

            $scope.create_gaf = function(gene) {
                //$location.path('/gaf/create/').search({taxon: gene.organism.taxon, gene: gene.db_object_id});
                $location.path('/gaf/create/').search({gene_id: gene.id});
            };
    }]);
}
