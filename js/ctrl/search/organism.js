export default function(cacaoApp) {
    cacaoApp.controller('SearchOrganismCtrl', ['$scope', 'CacaoBackend',
        function($scope, CacaoBackend) {
            CacaoBackend.all('organisms').getList($scope.query).then(function(data) {
                $scope.organisms = data;
            });
    }]);
}
