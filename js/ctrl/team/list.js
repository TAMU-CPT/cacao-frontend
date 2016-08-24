export default function(cacaoApp) {
    cacaoApp.controller('TeamListCtrl', ['$scope', 'CacaoBackend',
        function($scope, CacaoBackend) {
            CacaoBackend.all('groups').getList().then(function(data) {
                $scope.teams = data;
            });
    }]);
}
