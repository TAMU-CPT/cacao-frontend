export default function(cacaoApp) {
    cacaoApp.controller('SearchGeneCtrl', ['$scope', 'CacaoBackend', '$location',
        function($scope, CacaoBackend, $location) {
            CacaoBackend.all('genes').getList($scope.query).then(function(data) {
                $scope.genes = data;
            });

            $scope.create_gaf = function(gene) {
                console.log(gene);
                $location.path('/gaf/create/').search({taxon: gene.organism.taxon, gene: gene.db_object_id});
            };
    }]);
}
