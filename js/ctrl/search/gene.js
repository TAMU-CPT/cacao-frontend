export default function(cacaoApp) {
    cacaoApp.controller('SearchGeneCtrl', ['$scope', 'CacaoBackend', '$location',
        function($scope, CacaoBackend, $location) {
            CacaoBackend.all('genes').getList($scope.query).then(function(data) {
                $scope.genes = data;
            });

            $scope.create_gaf = function(gene) {
                //$location.path('/gaf/create/').search({taxon: gene.organism.taxon, gene: gene.db_object_id});
                $location.path('/gaf/create/').search({gene_id: gene.id});
            };
    }]);
}
